import React, { useState, useRef } from 'react';
import Button from './Button';
import UploadIcon from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  label: string;
  accept?: string; // e.g., '.xlsx, .xls'
  id: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, label, accept = ".xlsx, .xls", id, disabled = false }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (accept) {
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!acceptedTypes.includes(fileExtension) && !acceptedTypes.includes(file.type)) {
           setError(`Invalid file type. Please upload a ${accept} file.`);
           setFileName(null);
           if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
           return;
        }
      }
      setFileName(file.name);
      onFileUpload(file);
    } else {
      setFileName(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <input
          type="file"
          id={id}
          accept={accept}
          onChange={handleFileChange}
          ref={fileInputRef}
          className="sr-only" // Hidden, triggered by button
          disabled={disabled}
        />
        <Button
            type="button"
            variant="ghost"
            onClick={handleButtonClick}
            leftIcon={<UploadIcon />}
            className="w-full justify-start text-left truncate"
            disabled={disabled}
        >
            {fileName ? <span className="truncate max-w-xs" title={fileName}>{fileName}</span> : 'Choose file...'}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
       {!fileName && <p className="mt-1 text-xs text-gray-500">Accepted formats: {accept}</p>}
    </div>
  );
};

export default FileUpload;
