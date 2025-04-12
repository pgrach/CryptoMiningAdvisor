const Footer = () => {
  return (
    <footer className="border-t border-[#30363D] px-4 py-3">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-3 sm:mb-0">
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} CryptoMine<span className="text-accent">AI</span> | v2.3.4</span>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
          <a href="#" className="hover:text-foreground">Terms of Service</a>
          <a href="#" className="hover:text-foreground">Support</a>
          <a href="#" className="hover:text-foreground">Documentation</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
