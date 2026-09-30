
const Button = ({
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2
        bg-yellow-500 hover:bg-yellow-400
        disabled:bg-yellow-500/50
        text-zinc-950 font-semibold
        py-3.5 px-5 rounded-xl
        transition-all duration-200
        shadow-lg shadow-yellow-500/10
        hover:shadow-yellow-500/20
        disabled:cursor-not-allowed
        ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
