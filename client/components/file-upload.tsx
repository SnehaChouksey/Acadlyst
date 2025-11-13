"use client";
import * as React from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import UpgradeModal from "./upgrade-modal";

interface FileUploadProps {
  onUploaded?: (data: { file: File; response: any }) => void | Promise<void>;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({ onUploaded }) => {
  const { userId } = useAuth();
  const [uploading, setUploading] = React.useState(false);
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleFileUploadButtonClick = () => {
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', 'application/pdf');
    el.addEventListener('change', async () => {
      setError('');
      setSuccess('');
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (!file) return;
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append('pdf', file);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/pdf`, {
            method: 'POST',
            headers: { 'x-clerk-id': userId || '' },
            body: formData,
          });
          if (response.status === 403) {
            setShowUpgrade(true);
            setUploading(false);
            return;
          }
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
          const data = await response.json();
          if (onUploaded) {
            await onUploaded({ file, response: data });
          }
          setSuccess('File uploaded successfully!');
        } catch (error: any) {
          setError('Failed to upload file: ' + (error?.message || 'Unknown error'));
        } finally {
          setUploading(false);
        }
      }
    });
    el.click();
  };

  // Auto-hide message
  React.useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div
      className={`relative bg-background text-foreground hover:bg-accent/80 hover:shadow-lg hover:border-accent/10 hover:shadow-foreground/15 shadow-2xl h-1 flex justify-center items-center p-6 rounded-lg border-2 border-accent/30 transition-all ${
        uploading ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-primary'
      }`}
      onClick={!uploading ? handleFileUploadButtonClick : undefined}
    >
      <div className="flex justify-center items-center flex-row gap-3">
        <Upload className="h-6 w-6 text-muted-foreground" />
        <h3 className="text-lg font-medium">
          {uploading ? 'Uploading...' : 'Upload PDF File'}
        </h3>
      </div>
      {/* Only UI change: shows feedback inline, not with alert() */}
      {error && (
        <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 px-5 py-2 rounded bg-red-950/90 border border-red-500 text-red-300 text-xs z-20 shadow">
          {error}
        </div>
      )}
      {success && (
        <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 px-5 py-2 rounded bg-green-950/80 border border-green-500 text-green-300 text-xs z-20 shadow">
          {success}
        </div>
      )}
      <UpgradeModal 
        open={showUpgrade} 
        onClose={() => setShowUpgrade(false)}
        feature="summarizer"
      />
    </div>
  );
};

export default FileUploadComponent;
