
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Share2, Check } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/projects');
  };

  return (
    <div className="space-y-8">
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-center text-3xl">Welcome to ChatGantt</CardTitle>
          <CardDescription className="text-center text-lg">
            Create and manage your Gantt charts with ease
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto py-6">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Visual Planning</h3>
              <p className="text-center text-gray-600">Create and visualize project timelines effortlessly</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <MessageSquare className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Natural Language</h3>
              <p className="text-center text-gray-600">Update projects using simple chat commands</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
              <Share2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Easy Sharing</h3>
              <p className="text-center text-gray-600">Export and import projects with one click</p>
            </div>
          </div>
          <Button onClick={handleGetStarted} size="lg" className="px-8">
            Get Started
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Quick guide to using ChatGantt</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Create a new project with custom timeline</li>
              <li>Add tasks and set dependencies</li>
              <li>Use chat commands to update project</li>
              <li>Export your project for sharing</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>What makes ChatGantt special</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-2" />
                Interactive Gantt chart visualization
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-2" />
                Natural language task management
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-2" />
                Project templates and examples
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary mr-2" />
                Export and import functionality
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
