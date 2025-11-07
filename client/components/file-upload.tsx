'use client';
import * as React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onUploaded?: (data: { file: File; response: any }) => void | Promise<void>;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({ onUploaded }) => {
  const [uploading, setUploading] = React.useState(false);

  const handleFileUploadButtonClick = () => {
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', 'application/pdf');

    el.addEventListener('change', async () => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (!file) return;

        setUploading(true);

        try {
          // Create FormData
          const formData = new FormData();
          formData.append('pdf', file);

          // Send to backend
          console.log("Uploading file:", file.name);
          const response = await fetch('http://localhost:8000/upload/pdf', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const data = await response.json();
          console.log("Upload response:", data);

          // Call parent callback with response
          if (onUploaded) {
            await onUploaded({ file, response: data });
          }

          alert('File uploaded successfully!');
        } catch (error) {
          console.error('Upload error:', error);
          alert('Failed to upload file: ' + (error as Error).message);
        } finally {
          setUploading(false);
        }
      }
    });

    el.click();
  };

  return (
    <div
      className={`bg-background text-foreground shadow-2xl flex justify-center items-center p-6 rounded-lg border-2 border-dashed transition-all ${
        uploading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-primary'
      }`}
      onClick={!uploading ? handleFileUploadButtonClick : undefined}
    >
      <div className="flex justify-center items-center flex-col gap-3">
        <Upload className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-medium">
          {uploading ? 'Uploading...' : 'Upload PDF File'}
        </h3>
        <p className="text-sm text-muted-foreground">Click to select a PDF document</p>
      </div>
    </div>
  );
};

export default FileUploadComponent;

