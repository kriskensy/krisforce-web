'use client'
import { useState, useRef } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { updateContent, uploadImage } from "@/lib/actions/cms"
import { toast } from "sonner"
import { X, Check, ImageIcon } from "lucide-react"

export default function ContentEditor({ item }){
  const [value, setValue] = useState(item.value);
  const [loading, setLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  //local display
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if(!file) return;

    setPendingFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  const handleCancel = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    setValue(item.value); //back to old value

    if(fileInputRef.current) //clear fileinput
      fileInputRef.current.value = "";
  }

  const handleSave = async () => {
    setLoading(true);
    let finalValue = value;

    try {
      //upload file if new
      if (pendingFile) {
        const formData = new FormData();
        formData.append('file', pendingFile);
        const uploadResult = await uploadImage(formData);
        
        if (uploadResult.url) {
          finalValue = uploadResult.url;
        } else {
          throw new Error(uploadResult.error);
        }
      }

      //add url to site_content
      const result = await updateContent(item.id, finalValue);

      if (result.success) {
        toast.success(`${item.label} updated!`);
        setValue(finalValue);
        setPendingFile(null);
        setPreviewUrl(null);

        if(fileInputRef.current) //clear fileinput
          fileInputRef.current.value = "";
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="flex flex-col space-y-2 border-b pb-4 last:border-0">
      <label className="text-sm font-semibold text-muted-foreground">{item.label}</label>
      
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {item.type === 'text' && (
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          )}
          
          {item.type === 'richtext' && (
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} />
          )}

          {item.type === 'image' && (
            <div className="space-y-3">
              <Input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect} 
                accept="image/*"
                className="cursor-pointer" 
              />
              
              {/* file preview*/}
              <div className="relative w-40 h-24 bg-muted rounded border overflow-hidden group">
                <img 
                  src={previewUrl || value} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                {pendingFile && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold">
                    PREVIEW
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* action buttons */}
        {(value !== item.value || pendingFile) && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="default" 
              onClick={handleSave} 
              disabled={loading}
            >
              {loading ? "Saving..." : <Check className="w-4 h-4 mr-1" />}
              {loading ? "" : "Accept"}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel} 
              disabled={loading}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}