import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#2d3a43] text-white pt-16 pb-8 px-6 md:px-16 lg:px-24 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold tracking-tighter">setmore</span>
              <div className="flex flex-col -space-y-1">
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-white"></div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white"></div>
              </div>
            </div>
            
            <a href="mailto:help@setmore.com" className="block text-lg hover:text-green-400">
              help@setmore.com
            </a>

            <div className="flex space-x-5 text-gray-400">
              {/* Fallback text icons so it doesn't crash if Lucide is missing */}
              <span className="cursor-pointer hover:text-white font-bold">FB</span>
              <span className="cursor-pointer hover:text-white font-bold">IG</span>
              <span className="cursor-pointer hover:text-white font-bold">TW</span>
              <span className="cursor-pointer hover:text-white font-bold">YT</span>
            </div>
          </div>

          {/* Links Columns */}
          {[
            { title: "Product", links: ["Mission", "Integrations", "Features", "Pricing"] },
            { title: "Resources", links: ["Blog", "Guides", "Partners", "Support"] },
            { title: "Legal", links: ["Terms", "Privacy", "Status", "Sitemap"] }
          ].map((group) => (
            <div key={group.title}>
              <h4 className="text-gray-400 text-sm font-semibold mb-6 uppercase tracking-wider">{group.title}</h4>
              <ul className="space-y-3 text-[15px] text-white/70">
                {group.links.map(link => (
                  <li key={link} className="hover:text-white cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-4">
             <div className="bg-white/10 px-4 py-2 rounded text-xs">App Store</div>
             <div className="bg-white/10 px-4 py-2 rounded text-xs">Play Store</div>
          </div>
          <div className="text-[11px] text-gray-500">
            © Setmore Appointments | English
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;