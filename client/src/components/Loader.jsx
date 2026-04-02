export default function Loader({ text = 'Processing…' }) {
  return (
    <div className="loader-wrapper">
      <div className="loader-ring"></div>
      <p>{text}</p>
    </div>
  );
}
