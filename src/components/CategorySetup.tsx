
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { BudgetCategory } from "@/pages/Dashboard";

interface CategorySetupProps {
  monthlyIncome: number;
  onComplete: (categories: BudgetCategory[]) => void;
}

const PRESET_CATEGORIES = [
  { name: "Rent/Mortgage", color: "#3b82f6" },
  { name: "Groceries", color: "#10b981" },
  { name: "Transportation", color: "#f59e0b" },
  { name: "Utilities", color: "#8b5cf6" },
  { name: "Internet", color: "#06b6d4" },
  { name: "Phone", color: "#84cc16" },
  { name: "Insurance", color: "#f97316" },
  { name: "Entertainment", color: "#ec4899" },
  { name: "Dining Out", color: "#ef4444" },
  { name: "Healthcare", color: "#14b8a6" },
  { name: "Clothing", color: "#a855f7" },
  { name: "Savings", color: "#22c55e" },
];

const CategorySetup = ({ monthlyIncome, onComplete }: CategorySetupProps) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [customCategories, setCustomCategories] = useState<Array<{name: string, color: string}>>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCategoryToggle = (categoryName: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryName)) {
      newSelected.delete(categoryName);
      const newBudgets = { ...categoryBudgets };
      delete newBudgets[categoryName];
      setCategoryBudgets(newBudgets);
    } else {
      newSelected.add(categoryName);
    }
    setSelectedCategories(newSelected);
  };

  const handleBudgetChange = (categoryName: string, amount: number) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [categoryName]: amount
    }));
  };

  const addCustomCategory = () => {
    if (newCategoryName.trim()) {
      const colors = ["#6366f1", "#8b5cf6", "#d946ef", "#f59e0b", "#06b6d4", "#10b981"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      setCustomCategories(prev => [...prev, { 
        name: newCategoryName.trim(), 
        color: randomColor 
      }]);
      setSelectedCategories(prev => new Set([...prev, newCategoryName.trim()]));
      setNewCategoryName("");
    }
  };

  const removeCustomCategory = (categoryName: string) => {
    setCustomCategories(prev => prev.filter(cat => cat.name !== categoryName));
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      newSet.delete(categoryName);
      return newSet;
    });
    const newBudgets = { ...categoryBudgets };
    delete newBudgets[categoryName];
    setCategoryBudgets(newBudgets);
  };

  const allCategories = [...PRESET_CATEGORIES, ...customCategories];
  const totalAllocated = Object.values(categoryBudgets).reduce((sum, amount) => sum + amount, 0);
  const remainingIncome = monthlyIncome - totalAllocated;

  const canComplete = selectedCategories.size > 0 && 
    Array.from(selectedCategories).every(cat => categoryBudgets[cat] > 0);

  const handleComplete = () => {
    const categories: BudgetCategory[] = Array.from(selectedCategories).map((categoryName, index) => {
      const categoryData = allCategories.find(cat => cat.name === categoryName);
      return {
        id: `cat-${index}`,
        name: categoryName,
        budgetAmount: categoryBudgets[categoryName] || 0,
        spent: 0,
        color: categoryData?.color || "#6366f1"
      };
    });
    onComplete(categories);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Set Up Your Budget Categories</CardTitle>
            <p className="text-center text-gray-600">
              Choose categories and set monthly budgets for each
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Monthly Income:</span>
                <span className="font-bold">${monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Allocated:</span>
                <span className="font-bold">${totalAllocated.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span>Remaining:</span>
                <span className={`font-bold ${remainingIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${remainingIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preset Categories */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Common Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {PRESET_CATEGORIES.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={category.name}
                      checked={selectedCategories.has(category.name)}
                      onCheckedChange={() => handleCategoryToggle(category.name)}
                    />
                    <Label htmlFor={category.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </Label>
                  </div>
                  {selectedCategories.has(category.name) && (
                    <div className="ml-6">
                      <Input
                        type="number"
                        placeholder="Monthly budget amount"
                        value={categoryBudgets[category.name] || ""}
                        onChange={(e) => handleBudgetChange(category.name, Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Categories */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Custom Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedCategories.has(category.name)}
                        onCheckedChange={() => handleCategoryToggle(category.name)}
                      />
                      <Label className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomCategory(category.name)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {selectedCategories.has(category.name) && (
                    <div className="ml-6">
                      <Input
                        type="number"
                        placeholder="Monthly budget amount"
                        value={categoryBudgets[category.name] || ""}
                        onChange={(e) => handleBudgetChange(category.name, Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Add custom category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomCategory()}
                />
                <Button onClick={addCustomCategory} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleComplete}
          disabled={!canComplete}
          className="w-full"
          size="lg"
        >
          Complete Budget Setup
        </Button>
      </div>
    </div>
  );
};

export default CategorySetup;
