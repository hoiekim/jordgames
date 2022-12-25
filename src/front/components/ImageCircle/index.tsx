import "./index.css";

interface Props {
  radius: number;
  url: string;
}

const ImageCircle = ({ radius, url }: Props) => {
  return (
    <div
      className="ImageCircle"
      style={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        width: radius,
        height: radius,
        borderRadius: radius / 2,
      }}
    >
      <img
        alt="game_thumbnail"
        src={url}
        style={{
          maxWidth: radius,
          maxHeight: radius,
          width: "auto",
          height: "auto",
        }}
      />
    </div>
  );
};

export default ImageCircle;
