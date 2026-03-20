export default function Footer() {
  const sections = [
    { title: "Platform", links: ["About", "Challenges", "Community"] },
    { title: "Resources", links: ["Documentation", "Security Research"] },
    { title: "Legal", links: ["Privacy Policy", "Terms"] },
  ];

  return (
    <footer className="w-full border-t border-border bg-card py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">© AccessDenied</p>
        </div>
      </div>
    </footer>
  );
}