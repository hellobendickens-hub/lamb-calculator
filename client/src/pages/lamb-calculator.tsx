import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  Users, 
  Utensils, 
  CheckCircle, 
  ShoppingCart, 
  Truck,
  ChefHat
} from "lucide-react";
import type { CalculationRequest, CalculationResult } from "@shared/schema";

export default function LambCalculator() {
  const [people, setPeople] = useState(1);
  const [hungerLevel, setHungerLevel] = useState<'snacky' | 'hungry' | 'starving'>('hungry');
  const [showResults, setShowResults] = useState(false);

  const calculateMutation = useMutation({
    mutationFn: async (data: CalculationRequest): Promise<CalculationResult> => {
      const response = await apiRequest('POST', '/api/calculate-lamb', data);
      return response.json();
    },
    onSuccess: () => {
      setShowResults(true);
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  });

  const handleCalculate = () => {
    calculateMutation.mutate({ people, hungerLevel });
  };

  const hungerOptions = [
    { 
      key: 'snacky' as const, 
      label: 'Snacky', 
      description: '4-6oz per person',
      multiplier: 0.75 
    },
    { 
      key: 'hungry' as const, 
      label: 'Hungry', 
      description: '6-8oz per person',
      multiplier: 1 
    },
    { 
      key: 'starving' as const, 
      label: 'Starving', 
      description: '8-10oz per person',
      multiplier: 1.25 
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold text-brand-orange">
                <ChefHat className="inline-block mr-2 h-8 w-8" />
                LambStop
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-brand-orange transition-colors">Menu</a>
                <a href="#" className="text-gray-600 hover:text-brand-orange transition-colors">Cuts</a>
                <a href="#" className="text-brand-orange font-medium">Lamb Calculator™</a>
                <a href="#" className="text-gray-600 hover:text-brand-orange transition-colors">Locations</a>
              </div>
            </div>
            <Button className="bg-brand-orange hover:bg-brand-orange-dark text-white rounded-full">
              Order Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Lamb Calculator™
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Need a Hand with Your Order?
          </p>
          
          {/* Hero Image */}
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500" 
              alt="Premium lamb cuts arrangement" 
              className="w-full max-w-lg mx-auto rounded-2xl shadow-lg object-cover h-64"
            />
          </div>
        </div>

        {/* Calculator Section */}
        <Card className="rounded-3xl shadow-xl mb-8">
          <CardContent className="p-8 sm:p-12">
            {/* Group Size Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How many in your crew?
              </h2>
              
              {/* People Count Display */}
              <div className="text-center mb-8">
                <motion.div 
                  className="inline-flex items-center justify-center w-24 h-24 bg-brand-orange rounded-full mb-4"
                  key={people}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-3xl font-bold text-white">{people}</span>
                </motion.div>
                <div className="text-lg text-gray-600">
                  {people === 1 ? 'person' : 'people'}
                </div>
              </div>

              {/* Custom Slider */}
              <div className="relative mb-8">
                <Slider
                  value={[people]}
                  onValueChange={(value) => setPeople(value[0])}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full lamb-slider"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>1</span>
                  <span>20+</span>
                </div>
              </div>
            </div>

            {/* Hunger Level Section */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How hungry?
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {hungerOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={hungerLevel === option.key ? "default" : "outline"}
                    className={`py-6 px-6 rounded-full transition-all duration-200 h-auto ${
                      hungerLevel === option.key 
                        ? 'bg-brand-orange text-white border-brand-orange hover:bg-brand-orange-dark' 
                        : 'bg-gray-100 text-gray-700 border-transparent hover:bg-brand-orange hover:text-white hover:border-brand-orange'
                    }`}
                    onClick={() => setHungerLevel(option.key)}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-sm opacity-75 mt-1">{option.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Lamb Image */}
            <div className="text-center mb-8">
              <img 
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
                alt="Grilled lamb chops with herbs" 
                className="w-full max-w-md mx-auto rounded-xl shadow-md object-cover h-48"
              />
            </div>

            {/* Calculate Button */}
            <div className="text-center">
              <Button 
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
                className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-4 px-12 rounded-full text-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {calculateMutation.isPending ? 'Calculating...' : 
                  people === 1 ? 'Calculate Lamb' : `Calculate Lamb for ${people}`
                }
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <AnimatePresence>
          {showResults && calculateMutation.data && (
            <motion.div
              id="results"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-cream to-white rounded-3xl shadow-xl">
                <CardContent className="p-8 sm:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Your Lamb Recommendation
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quantity Recommendations */}
                    <div className="space-y-6">
                      <Card className="bg-white shadow-md">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-brand-orange mb-4 flex items-center">
                            <Calculator className="mr-2 h-5 w-5" />
                            Total Lamb Needed
                          </h3>
                          <div className="text-3xl font-bold text-gray-900 mb-2">
                            {calculateMutation.data.totalWeight}
                          </div>
                          <div className="text-gray-600">
                            {calculateMutation.data.totalDescription}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white shadow-md">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-lamb-green mb-4 flex items-center">
                            <Utensils className="mr-2 h-5 w-5" />
                            Recommended Cuts
                          </h3>
                          <div className="space-y-3">
                            {calculateMutation.data.cuts.map((cut, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  <Utensils className="text-lamb-green mr-3 h-4 w-4" />
                                  <span className="font-medium">{cut.name}</span>
                                </div>
                                <span className="text-gray-600 text-sm">{cut.amount}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Visual Guide */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <img 
                          src="https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
                          alt="Lamb shoulder roast" 
                          className="rounded-xl shadow-md w-full h-32 object-cover"
                        />
                        <img 
                          src="https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
                          alt="Rack of lamb" 
                          className="rounded-xl shadow-md w-full h-32 object-cover"
                        />
                        <img 
                          src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
                          alt="Lamb leg steaks" 
                          className="rounded-xl shadow-md w-full h-32 object-cover"
                        />
                        <img 
                          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
                          alt="Braised lamb shanks" 
                          className="rounded-xl shadow-md w-full h-32 object-cover"
                        />
                      </div>

                      <Card className="bg-white shadow-md">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-warm-brown mb-4 flex items-center">
                            <Users className="mr-2 h-5 w-5" />
                            Serving Tips
                          </h3>
                          <ul className="space-y-2 text-gray-600">
                            {calculateMutation.data.servingTips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="text-lamb-green mr-2 mt-1 h-4 w-4 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="text-center mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 px-8 rounded-full transition-colors duration-200">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Order for Pickup
                      </Button>
                      <Button className="bg-lamb-green hover:bg-opacity-80 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200">
                        <Truck className="mr-2 h-4 w-4" />
                        Schedule Delivery
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Content */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300" 
            alt="People enjoying dinner together" 
            className="rounded-2xl shadow-lg w-full h-64 object-cover"
          />
          <img 
            src="https://images.unsplash.com/photo-1502301103665-0b95cc738daf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300" 
            alt="Family sharing a meal" 
            className="rounded-2xl shadow-lg w-full h-64 object-cover"
          />
        </div>
      </div>
    </div>
  );
}
