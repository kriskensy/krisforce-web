'use client'
import { useState } from "react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { updateContent, uploadImage } from "@/lib/actions/cms"
import { toast } from "sonner"//TODO maybe something else?

export default function ContentEditor({ item }){
  const [value, setValue] = useState(item.value);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateContent(item.id, value);

    if(result.success)
      renderToStaticMarkup.succes(`${item.label} updated!`);
    
    setLoading(false);
  }

  const handleChange = async (event) => {
    const file = event.target.files[0];
    if(!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImage(formData);
    if(result.url) {
      setValue(result.url);
      await updateContent(item.id, result.url);
      toast.succes("Image uploaded and updated!");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-muted-foreground">{item.label}</label>
      <div className="flex gap-2">
        {item.type === 'text' && (
          <Input value={value} onChange={(event) => setValue(event.target.value)}/>
        )}
        {item.type === 'richtext' && (
          <Textarea value={value} onChange={(event) => setValue(event.target.value)}/>
        )}
        {item.type === 'image' && (
          <div className="flex flex-col gap-2 w-full">
            <Input type="file" onChange={handleChange} accept="image/*"/>
            <img src={value} alt="Preview" className="h-20 object-cover rounded border"/>
          </div>
        )}
        {item.type !== 'image' && (
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
    </div>
  )
}