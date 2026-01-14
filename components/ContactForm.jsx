'use client'

import { getBrowserClient } from "@/lib/supabase/client";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactForm ({ content }) {
  const supabase = getBrowserClient();

  const getCmsValue = (key, fallback) => content?.find(item => item.key === key)?.value || fallback;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    email: "",
    name: "",
    message: ""
  })

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try{
      const { error } = await supabase
        .from("contact_messages")
        .insert([
          {
            sender_name: formData.name,
            sender_email: formData.email,
            subject: formData.subject,
            message_text: formData.message,
            status: 'New'
          }
        ])

      if(error) throw error;

      toast.success("Message sent successfully.")

      setFormData({
        subject: "",
        email: "",
        name: "",
        message: ""
      })

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return(
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input 
        placeholder="Subject" 
        className="h-9 bg-background"
        value={formData.subject}
        onChange={(event) => setFormData({...formData, subject: event.target.value})}
        required
      />
      <Input 
        type="email"
        placeholder="email@example.com" 
        className="h-9 bg-background"
        value={formData.email}
        onChange={(event) => setFormData({...formData, email: event.target.value})}
        required
      />
      <Input 
        placeholder="Your name" 
        className="h-9 bg-background"
        value={formData.name}
        onChange={(event) => setFormData({...formData, name: event.target.value})}
        required
      />
      <Textarea
        className="w-full rounded-md border bg-background p-3 text-sm min-h-[80px]"
        placeholder="How can we help you?"
        value={formData.message}
        onChange={(event) => setFormData({...formData, message: event.target.value})}
        required
      />
      <Button size="sm" type="submit" disabled={isSubmitting}>
        {isSubmitting 
          ? "Sending..." 
          : getCmsValue('footer_form_submit', 'Contact us')
        }
      </Button>
    </form>
  )
}