import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';

export default function FileDropZone() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: File[]) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      ...newFiles,
    ]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  return (
    <div className="max-w-md p-5">

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFileSelect}
      />

      

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          cursor-pointer rounded-lg border-2 border-dashed
          p-10 text-center transition
          ${
            isDragActive
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }
        `}
      >
        <p className="font-bold">
          {isDragActive
            ? 'Drop your files here!'
            : 'Drag & drop or click to select'}
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-5">
          {files.map((file, index) => (
            <li key={index}>
              {file.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}