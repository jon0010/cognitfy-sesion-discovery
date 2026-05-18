const ANDROID_SRC = "/androide_png.png";

export function AndroidScrollSequence() {
  return (
    <div
      className="core-android-stage core-android-stage--sticky relative ml-auto w-full"
      aria-hidden
    >
      <div className="core-android-figure">
        <img
          src={ANDROID_SRC}
          alt=""
          width={1158}
          height={770}
          className="core-android-hero block w-auto max-w-none object-contain object-bottom-right"
          draggable={false}
        />
        <div className="core-android-fade-right" aria-hidden />
        <div className="core-android-fade-bottom" aria-hidden />
      </div>
    </div>
  );
}
