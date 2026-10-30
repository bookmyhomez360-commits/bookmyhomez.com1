import React from 'react';

// A real <a href> link (crawlable by Google, works with "open in new tab")
// that still navigates inside the app without a page reload on a normal click.
interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  onNavigate: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, onNavigate, children, onClick, ...rest }) => (
  <a
    href={href}
    onClick={(e) => {
      onClick?.(e);
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      onNavigate();
    }}
    {...rest}
  >
    {children}
  </a>
);
