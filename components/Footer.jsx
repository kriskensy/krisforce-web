import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import ContactForm from "./ContactForm";

export const Footer = ({ content }) => {

  //for easier access
  const getCmsFooterValue = (key, fallback) => content?.find(item => item.key === key)?.value || fallback;

  return (
    <footer className="bg-white dark:bg-[#161B22] border-t py-12">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 text-left">

        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
            {getCmsFooterValue('footer_content_title', 'Contact Information')}
          </h4>
          <div className="text-sm whitespace-pre-line leading-relaxed">
            {getCmsFooterValue('footer_address', 'Adress not set in CMS.')}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
            {getCmsFooterValue('footer_form_title', 'Send us a message')}
          </h4>
          <ContactForm content={content}/>
        </div>

      </div>
    </footer>
  );
};