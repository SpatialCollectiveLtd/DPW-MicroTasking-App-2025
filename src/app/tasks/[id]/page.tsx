'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Camera, 
  Upload,
  X,
  Check,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';

interface TaskImage {
  id: string;
  file: File;
  preview: string;
  tags: string[];
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  payment: number;
  estimatedTime: number;
  location: string;
  requiredImages: number;
  tags: string[];
  instructions: string[];
  requirements: string[];
}

// Mock task data
const mockTask: Task = {
  id: '1',
  title: 'Document Road Conditions',
  description: 'Take photos of road surfaces, potholes, and infrastructure along designated routes in your settlement.',
  category: 'Infrastructure',
  payment: 50,
  estimatedTime: 30,
  location: 'Kibera Settlement',
  requiredImages: 5,
  tags: ['roads', 'infrastructure', 'maintenance'],
  instructions: [
    'Walk along the designated routes in your settlement',
    'Take clear photos of road conditions including potholes, cracks, and general surface quality',
    'Ensure good lighting and clear visibility in all photos',
    'Add relevant tags to describe what you see in each image',
    'Include a brief description for each photo explaining the condition'
  ],
  requirements: [
    'Photos must be taken during daylight hours',
    'All images must be geo-tagged with location',
    'Minimum 5 photos required',
    'Each photo must include descriptive tags',
    'Photos should show different areas/conditions'
  ]
};

export default function TaskDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [task, setTask] = useState<Task | null>(null);
  const [images, setImages] = useState<TaskImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTask(mockTask);
      setIsLoading(false);
    }, 1000);
  }, [params.id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const imageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        
        const newImage: TaskImage = {
          id: imageId,
          file,
          preview,
          tags: [],
          description: ''
        };

        setImages(prev => [...prev, newImage]);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = () => {
    // For now, trigger file input
    // In a real app, this would open the camera directly
    fileInputRef.current?.click();
  };

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
    
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
  };

  const addTagToImage = (imageId: string, tag: string) => {
    if (!tag.trim()) return;
    
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, tags: [...img.tags, tag.trim().toLowerCase()] }
        : img
    ));
  };

  const removeTagFromImage = (imageId: string, tagIndex: number) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, tags: img.tags.filter((_, index) => index !== tagIndex) }
        : img
    ));
  };

  const updateImageDescription = (imageId: string, description: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, description }
        : img
    ));
  };

  const handleSubmitTask = async () => {
    if (images.length < (task?.requiredImages || 0)) {
      alert(`Please upload at least ${task?.requiredImages} images`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tasks/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task?.id,
          images: images.map(img => ({
            id: img.id,
            tags: img.tags,
            description: img.description
          })),
          notes: 'Task completed via web interface'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Task submitted successfully! Submission ID: ${result.submissionId}`);
        router.push('/tasks');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedImage = images.find(img => img.id === selectedImageId);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!session || !task) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="border-2 border-gray-200 hover:border-red-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-black">{task.title}</h1>
                <p className="text-gray-600">{task.category}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-500">KSh {task.payment}</div>
              <div className="text-sm text-gray-500">per task</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Task Details */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Task Info */}
            <Card className="bg-white border-2 border-gray-100 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{task.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{task.estimatedTime} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Camera className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{task.requiredImages} photos required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{task.location}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-black mb-2">Required Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-white border-2 border-gray-100 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {task.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="bg-amber-50 border-2 border-amber-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-amber-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {task.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-800">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Image Upload and Tagging */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upload Section */}
            <Card className="bg-white border-2 border-gray-100 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black flex items-center justify-between">
                  Upload Images ({images.length}/{task.requiredImages})
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCameraCapture}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Camera
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      variant="outline"
                      className="border-2 border-gray-200"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {images.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No images uploaded yet</p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Upload Your First Image
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className={`relative group cursor-pointer border-2 rounded-xl overflow-hidden ${
                          selectedImageId === image.id ? 'border-red-500' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedImageId(image.id)}
                      >
                        <img
                          src={image.preview}
                          alt="Task image"
                          className="w-full h-32 object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                          <div className="text-xs">
                            {image.tags.length} tags • {image.description ? 'Described' : 'No description'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Details */}
            {selectedImage && (
              <Card className="bg-white border-2 border-red-100 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-black">Image Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={selectedImage.preview}
                      alt="Selected image"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Description
                    </label>
                    <Textarea
                      value={selectedImage.description}
                      onChange={(e) => updateImageDescription(selectedImage.id, e.target.value)}
                      placeholder="Describe what you see in this image..."
                      className="w-full h-20 resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Tags
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add a tag..."
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTagToImage(selectedImage.id, currentTag);
                            setCurrentTag('');
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          addTagToImage(selectedImage.id, currentTag);
                          setCurrentTag('');
                        }}
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full"
                        >
                          <span className="text-sm">#{tag}</span>
                          <button
                            onClick={() => removeTagFromImage(selectedImage.id, index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="sticky bottom-4">
              <Card className="bg-white border-2 border-gray-100 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold text-black">
                        Ready to Submit?
                      </div>
                      <div className="text-sm text-gray-600">
                        {images.length}/{task.requiredImages} images uploaded
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-500">
                        KSh {task.payment}
                      </div>
                      <div className="text-xs text-gray-500">
                        Upon approval
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSubmitTask}
                    disabled={images.length < task.requiredImages || isSubmitting}
                    className="w-full h-12 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold rounded-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Task'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}