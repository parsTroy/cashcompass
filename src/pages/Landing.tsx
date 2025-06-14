
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, PieChart, Target, TrendingUp, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CashCompass</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Navigate Your Wealth
            <span className="text-blue-600 dark:text-blue-400 block">Smart Budgeting</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Let CashCompass guide you to financial success with intelligent budget tracking that helps you maximize savings and build lasting wealth.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/auth">Start Your Journey</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose CashCompass?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center dark:bg-gray-700 dark:border-gray-600">
              <CardHeader>
                <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <CardTitle className="dark:text-white">Track Income</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="dark:text-gray-300">
                  Start with your monthly income and build your wealth strategy from there.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center dark:bg-gray-700 dark:border-gray-600">
              <CardHeader>
                <PieChart className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <CardTitle className="dark:text-white">Smart Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="dark:text-gray-300">
                  Pre-built categories for common expenses or create your own custom ones.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center dark:bg-gray-700 dark:border-gray-600">
              <CardHeader>
                <Target className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <CardTitle className="dark:text-white">Visual Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="dark:text-gray-300">
                  See how much you've spent in each category with clear visual indicators.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center dark:bg-gray-700 dark:border-gray-600">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                <CardTitle className="dark:text-white">Wealth Building</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="dark:text-gray-300">
                  Track spending and identify opportunities to maximize your savings potential.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Navigate Your Wealth?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have found their financial direction with CashCompass.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link to="/auth">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
