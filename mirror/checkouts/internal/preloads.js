
    (function() {
      var cdnOrigin = "https://cdn.shopify.com";
      var scripts = ["https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/polyfills-legacy.CA434lcI.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/app-legacy.D9KAbs6F.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/en-legacy.CtqS4l83.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/page-OnePage-legacy.Djk9-TBz.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/DeliveryMethodSelectorSection-legacy.YYAFNPVh.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/useEditorShopPayNavigation-legacy.D7UFhDm1.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/VaultedPayment-legacy.C7K2BlZS.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/PaymentButtons-legacy.5scA07dW.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/LocalizationExtensionField-legacy.DrdG2rUT.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/ShopPayOptInDisclaimer-legacy.B-YnFvJ1.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/ShipmentBreakdown-legacy.BFC1eb_O.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/MerchandiseModal-legacy.C7QM4moV.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/StackedMerchandisePreview-legacy.MZvkvMWG.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/component-ShopPayVerificationSwitch-legacy.ttiRvbVf.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/useSubscribeMessenger-legacy.Dbj4F9lE.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/index-legacy.DvGwjK9h.js","https://cdn.shopify.com/shopifycloud/checkout-web/assets/c1/PayButtonSection-legacy.CMmI0_nP.js"];
      var styles = [];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0494/7292/9960/files/Urban_Lamb_Logo_e25f00d7-c0ca-4d7f-9126-b84e5e7d69a3_x320.png?v=1730951175"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [cdnOrigin].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  