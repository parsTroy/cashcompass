
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, PieChart, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">BudgetBloom</h1>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Take Control of Your
            <span className="text-blue-600 block">Personal Budget</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Simple, mobile-first budget tracking that helps you understand where your money goes and achieve your financial goals.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/dashboard">Start Budgeting</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose BudgetBloom?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Track Income</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Start with your monthly income and build your budget from there.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <PieChart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Smart Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pre-built categories for common expenses or create your own custom ones.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Target className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Visual Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  See how much you've spent in each category with clear visual indicators.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Daily Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Log daily expenses and watch your progress toward budget goals.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Finances?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have taken control of their spending with BudgetBloom.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link to="/dashboard">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
