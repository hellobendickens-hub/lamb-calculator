package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"

	"golang.org/x/net/html"
)

type Mirrorer struct {
	baseURL   *url.URL
	outputDir string
	visited   sync.Map
	pending   sync.WaitGroup
	client    *http.Client
	semaphore chan struct{}
}

func NewMirrorer(baseURL, outputDir string) (*Mirrorer, error) {
	u, err := url.Parse(baseURL)
	if err != nil {
		return nil, err
	}

	if u.Scheme == "" {
		u.Scheme = "https"
	}

	return &Mirrorer{
		baseURL:   u,
		outputDir: outputDir,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		semaphore: make(chan struct{}, 5), // Limit concurrent downloads
	}, nil
}

func (m *Mirrorer) Start(startURL string) error {
	if err := os.MkdirAll(m.outputDir, 0755); err != nil {
		return err
	}

	m.downloadURL(startURL, true)
	m.pending.Wait()

	fmt.Println("\nMirror complete!")
	return nil
}

func (m *Mirrorer) downloadURL(urlStr string, isHTML bool) {
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return
	}

	if !parsedURL.IsAbs() {
		parsedURL = m.baseURL.ResolveReference(parsedURL)
	}

	// Only download from same host
	if parsedURL.Host != m.baseURL.Host {
		return
	}

	urlStr = parsedURL.String()

	// Check if already visited
	if _, loaded := m.visited.LoadOrStore(urlStr, true); loaded {
		return
	}

	m.pending.Add(1)
	go func() {
		defer m.pending.Done()
		m.semaphore <- struct{}{}        // Acquire
		defer func() { <-m.semaphore }() // Release

		if err := m.download(parsedURL, isHTML); err != nil {
			fmt.Printf("Error downloading %s: %v\n", urlStr, err)
		}
	}()
}

func (m *Mirrorer) download(u *url.URL, isHTML bool) error {
	fmt.Printf("Downloading: %s\n", u.String())

	resp, err := m.client.Get(u.String())
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("status %d", resp.StatusCode)
	}

	content, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	contentType := resp.Header.Get("Content-Type")

	// Determine if this is HTML/CSS that needs processing
	needsProcessing := strings.Contains(contentType, "text/html") ||
		strings.Contains(contentType, "text/css") ||
		isHTML

	var processedContent []byte
	if needsProcessing {
		if strings.Contains(contentType, "text/html") || isHTML {
			processedContent = m.processHTML(content, u)
		} else if strings.Contains(contentType, "text/css") {
			processedContent = m.processCSS(content, u)
		}
	} else {
		processedContent = content
	}

	// Save file
	filePath := m.urlToFilePath(u)
	if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil {
		return err
	}

	return os.WriteFile(filePath, processedContent, 0644)
}

func (m *Mirrorer) processHTML(content []byte, pageURL *url.URL) []byte {
	doc, err := html.Parse(bytes.NewReader(content))
	if err != nil {
		return content
	}

	var processNode func(*html.Node)
	processNode = func(n *html.Node) {
		if n.Type == html.ElementNode {
			switch n.Data {
			case "a", "link":
				m.processAttribute(n, "href", pageURL)
			case "img", "script", "source":
				m.processAttribute(n, "src", pageURL)
			case "video", "audio":
				m.processAttribute(n, "src", pageURL)
			case "form":
				m.processAttribute(n, "action", pageURL)
			}

			// Handle srcset
			if srcset := m.getAttr(n, "srcset"); srcset != "" {
				m.processSrcset(n, srcset, pageURL)
			}

			// Handle inline styles
			if style := m.getAttr(n, "style"); style != "" {
				newStyle := m.rewriteCSSURLs(style, pageURL)
				m.setAttr(n, "style", newStyle)
			}
		}

		// Handle style tags
		if n.Type == html.ElementNode && n.Data == "style" {
			if n.FirstChild != nil && n.FirstChild.Type == html.TextNode {
				cssContent := n.FirstChild.Data
				newCSS := m.rewriteCSSURLs(cssContent, pageURL)
				n.FirstChild.Data = newCSS
			}
		}

		for c := n.FirstChild; c != nil; c = c.NextSibling {
			processNode(c)
		}
	}

	processNode(doc)

	var buf bytes.Buffer
	html.Render(&buf, doc)
	return buf.Bytes()
}

func (m *Mirrorer) processAttribute(n *html.Node, attr string, pageURL *url.URL) {
	val := m.getAttr(n, attr)
	if val == "" {
		return
	}

	// Skip special URLs
	if strings.HasPrefix(val, "#") ||
		strings.HasPrefix(val, "data:") ||
		strings.HasPrefix(val, "javascript:") ||
		strings.HasPrefix(val, "mailto:") ||
		strings.HasPrefix(val, "tel:") {
		return
	}

	parsedURL, err := url.Parse(val)
	if err != nil {
		return
	}

	absURL := pageURL.ResolveReference(parsedURL)

	// Download if same host
	if absURL.Host == m.baseURL.Host {
		isHTML := attr == "href" && (n.Data == "a" || m.getAttr(n, "rel") == "")
		if n.Data == "link" {
			rel := m.getAttr(n, "rel")
			isHTML = !strings.Contains(rel, "stylesheet") && !strings.Contains(rel, "icon")
		}

		m.downloadURL(absURL.String(), isHTML)

		// Rewrite URL to relative path
		relativePath := m.makeRelativePath(pageURL, absURL)
		m.setAttr(n, attr, relativePath)
	}
}

func (m *Mirrorer) processSrcset(n *html.Node, srcset string, pageURL *url.URL) {
	parts := strings.Split(srcset, ",")
	var newParts []string

	for _, part := range parts {
		part = strings.TrimSpace(part)
		fields := strings.Fields(part)
		if len(fields) == 0 {
			continue
		}

		imgURL := fields[0]
		parsedURL, err := url.Parse(imgURL)
		if err != nil {
			newParts = append(newParts, part)
			continue
		}

		absURL := pageURL.ResolveReference(parsedURL)
		if absURL.Host == m.baseURL.Host {
			m.downloadURL(absURL.String(), false)
			relativePath := m.makeRelativePath(pageURL, absURL)
			fields[0] = relativePath
		}

		newParts = append(newParts, strings.Join(fields, " "))
	}

	m.setAttr(n, "srcset", strings.Join(newParts, ", "))
}

func (m *Mirrorer) processCSS(content []byte, pageURL *url.URL) []byte {
	cssStr := string(content)
	newCSS := m.rewriteCSSURLs(cssStr, pageURL)
	return []byte(newCSS)
}

func (m *Mirrorer) rewriteCSSURLs(css string, pageURL *url.URL) string {
	// Match url() in CSS
	re := regexp.MustCompile(`url\(['"]?([^'")\s]+)['"]?\)`)

	result := re.ReplaceAllStringFunc(css, func(match string) string {
		urlMatch := re.FindStringSubmatch(match)
		if len(urlMatch) < 2 {
			return match
		}

		urlStr := urlMatch[1]
		if strings.HasPrefix(urlStr, "data:") {
			return match
		}

		parsedURL, err := url.Parse(urlStr)
		if err != nil {
			return match
		}

		absURL := pageURL.ResolveReference(parsedURL)

		if absURL.Host == m.baseURL.Host {
			m.downloadURL(absURL.String(), false)
			relativePath := m.makeRelativePath(pageURL, absURL)
			return fmt.Sprintf("url('%s')", relativePath)
		}

		return match
	})

	// Handle @import
	importRe := regexp.MustCompile(`@import\s+['"]([^'"]+)['"]`)
	result = importRe.ReplaceAllStringFunc(result, func(match string) string {
		importMatch := importRe.FindStringSubmatch(match)
		if len(importMatch) < 2 {
			return match
		}

		urlStr := importMatch[1]
		parsedURL, err := url.Parse(urlStr)
		if err != nil {
			return match
		}

		absURL := pageURL.ResolveReference(parsedURL)

		if absURL.Host == m.baseURL.Host {
			m.downloadURL(absURL.String(), false)
			relativePath := m.makeRelativePath(pageURL, absURL)
			return fmt.Sprintf("@import '%s'", relativePath)
		}

		return match
	})

	return result
}

func (m *Mirrorer) urlToFilePath(u *url.URL) string {
	p := u.Path
	if p == "" || p == "/" {
		p = "/index.html"
	}

	// Add index.html to directories
	if strings.HasSuffix(p, "/") {
		p = path.Join(p, "index.html")
	}

	// Add .html if no extension and looks like a page
	ext := filepath.Ext(p)
	if ext == "" {
		p = p + ".html"
	}

	p = strings.TrimPrefix(p, "/")
	return filepath.Join(m.outputDir, p)
}

func (m *Mirrorer) makeRelativePath(from, to *url.URL) string {
	fromPath := m.urlToFilePath(from)
	toPath := m.urlToFilePath(to)

	rel, err := filepath.Rel(filepath.Dir(fromPath), toPath)
	if err != nil {
		return to.Path
	}

	// Convert to forward slashes for URLs
	return strings.ReplaceAll(rel, "\\", "/")
}

func (m *Mirrorer) getAttr(n *html.Node, key string) string {
	for i, attr := range n.Attr {
		if attr.Key == key {
			return n.Attr[i].Val
		}
	}
	return ""
}

func (m *Mirrorer) setAttr(n *html.Node, key, val string) {
	for i, attr := range n.Attr {
		if attr.Key == key {
			n.Attr[i].Val = val
			return
		}
	}
	n.Attr = append(n.Attr, html.Attribute{Key: key, Val: val})
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run mirror.go <url> [output_dir]")
		os.Exit(1)
	}

	targetURL := os.Args[1]
	outputDir := "mirror"

	if len(os.Args) >= 3 {
		outputDir = os.Args[2]
	}

	mirrorer, err := NewMirrorer(targetURL, outputDir)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Mirroring %s to %s\n\n", mirrorer.baseURL.String(), outputDir)

	if err := mirrorer.Start(targetURL); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}
