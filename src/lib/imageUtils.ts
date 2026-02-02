/**
 * Resize image to fit within Instagram/Facebook standard dimensions
 * Max width: 1080px, Max height: 1350px (4:5 ratio for portrait)
 * Maintains aspect ratio
 */
export async function resizeImage(file: File, maxWidth = 1080, maxHeight = 1350): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        // Only resize if image is larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            // Landscape
            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
          } else {
            // Portrait or square
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
          }
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            
            // Create new file from blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(resizedFile);
          },
          file.type,
          0.92 // Quality (0.92 is good balance between quality and file size)
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}
