// Props + prop destructuring: the parent (App) passes the title and subtitle.
function Header({ title, subtitle }) {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <p className="header-subtitle">{subtitle}</p>
    </header>
  );
}

export default Header;
