import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, Calendar, BarChart3, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface MonthlyData {
  user_id: string;
  category_id: string;
  category_name: string;
  category_color: string;
  month: string;
  total_spent: number;
  transaction_count: number;
}

interface ChartData {
  month: string;
  [key: string]: any;
}

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");
  const [chartType, setChartType] = useState("line");

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case "3months":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "6months":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "1year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 6);
      }

      const data = await api.getMonthlySpendingSummary(startDate, endDate);
      setMonthlyData(data || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (): ChartData[] => {
    const monthlyTotals = monthlyData.reduce((acc, item) => {
      const monthKey = new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, total: 0 };
      }
      
      acc[monthKey].total += Number(item.total_spent);
      acc[monthKey][item.category_name] = (acc[monthKey][item.category_name] || 0) + Number(item.total_spent);
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyTotals).sort((a, b) => {
      return new Date(a.month + " 1").getTime() - new Date(b.month + " 1").getTime();
    });
  };

  const preparePieData = () => {
    const categoryTotals = monthlyData.reduce((acc, item) => {
      if (!acc[item.category_name]) {
        acc[item.category_name] = {
          name: item.category_name,
          value: 0,
          color: item.category_color
        };
      }
      acc[item.category_name].value += Number(item.total_spent);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(categoryTotals);
  };

  const chartData = prepareChartData();
  const pieData = preparePieData();
  const categories = [...new Set(monthlyData.map(item => item.category_name))];
  const totalSpent = monthlyData.reduce((sum, item) => sum + Number(item.total_spent), 0);
  const avgMonthlySpending = chartData.length > 0 ? totalSpent / chartData.length : 0;

  const chartConfig = categories.reduce((config, category) => {
    const categoryData = monthlyData.find(item => item.category_name === category);
    config[category] = {
      label: category,
      color: categoryData?.category_color || '#3b82f6'
    };
    return config;
  }, {} as any);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-xl font-bold text-gray-900 dark:text-white hover:bg-transparent p-0"
            >
              CashCompass
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Spending Analytics</h1>
          </div>
          <Badge variant="secondary" className="text-sm dark:bg-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-300">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalSpent.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-300">Avg Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${avgMonthlySpending.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 dark:text-gray-300">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {chartData.length > 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <TrendingUp className="w-5 h-5" />
                Spending Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartType === "line" && (
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Total Spending"
                      />
                      {categories.map((category) => (
                        <Line
                          key={category}
                          type="monotone"
                          dataKey={category}
                          stroke={chartConfig[category]?.color || '#6b7280'}
                          strokeWidth={1}
                          name={category}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {chartType === "bar" && (
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {categories.map((category) => (
                        <Bar
                          key={category}
                          dataKey={category}
                          fill={chartConfig[category]?.color || '#6b7280'}
                          name={category}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {chartType === "pie" && (
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Start tracking expenses to see your spending trends and analytics.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="mt-4"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Analytics;
