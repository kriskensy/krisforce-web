import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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
          <form className="space-y-3">
            <Input placeholder="Subject" className="h-9 bg-background"/>
            <Input placeholder="email@example.com" className="h-9 bg-background"/>
            <Textarea
              className="w-full rounded-md border bg-background p-3 text-sm min-h-[80px]"
              placeholder="How can we help you?"
            />
            <Button size="sm">
              {getCmsFooterValue('footer_form_submit', 'Contact us')}
            </Button>
          </form>
        </div>

      </div>
    </footer>
  );
};