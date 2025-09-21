import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, MapPin, ArrowRight } from 'lucide-react';
import { FloorPlan } from '../types';

interface FloorPlanUploadProps {
  onFloorPlanSelect: (floorPlan: FloorPlan) => void;
}

const templates: FloorPlan[] = [
  { id: 'stadium1', name: 'Stadium Layout', type: 'template', imageUrl: '/templates/stadium.svg', width: 800, height: 600 },
  { id: 'arena1', name: 'Arena Layout', type: 'template', imageUrl: '/templates/arena.svg', width: 700, height: 500 },
  { id: 'mall1', name: 'Shopping Mall', type: 'template', imageUrl: '/templates/mall.svg', width: 900, height: 700 }
];

export const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({ onFloorPlanSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const floorPlan: FloorPlan = {
          id: `upload_${Date.now()}`,
          name: file.name,
          type: 'uploaded',
          imageUrl: e.target?.result as string,
          width: 800,
          height: 600
        };
        onFloorPlanSelect(floorPlan);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Setup Your Venue</h1>
        <p className="text-gray-400 text-lg">Upload a floorplan or choose from our templates</p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8"
      >
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            dragActive ? 'border-primary-500 bg-primary-500/10' : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Upload Floor Plan</h3>
          <p className="text-gray-400 mb-6">Drag & drop your venue layout or click to browse</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
          >
            <Image className="w-4 h-4 mr-2" />
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-4">Supports SVG, PNG, JPEG formats</p>
        </div>
      </motion.div>

      {/* Templates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary-400" />
          Or Choose a Template
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass-card p-6 cursor-pointer group hover:scale-105 transition-all duration-300"
              onClick={() => onFloorPlanSelect(template)}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-4 flex items-center justify-center">
                <Image className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="font-semibold text-white mb-2">{template.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{template.width}×{template.height}</span>
                <ArrowRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};