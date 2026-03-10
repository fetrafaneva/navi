import { AvatarState } from "../App";

interface AvatarProps {
  state: AvatarState;
}

export default function Avatar({ state }: AvatarProps) {
  return (
    <div
      className={`avatar ${state}`}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
    >
      <div className="avatar__shadow" />
      <div className="character">
        <div className="hair-back" />
        <div className="body">
          <div className="collar" />
          <div className="bow" />
          <div className="arm left" />
          <div className="arm right" id="arm-right" />
        </div>
        <div className="head">
          <div className="hair-top" />
          <div className="hair-side left" />
          <div className="hair-side right" />
          <div className="hair-bang bl" />
          <div className="hair-bang br" />
          <div className="hair-bang center" />
          <div className="face">
            <div className="eyes">
              <div className="eye">
                <div className="eye-white">
                  <div className="eye-iris" />
                  <div className="eye-pupil" />
                  <div className="eye-shine" />
                </div>
                <div className="eyelash" />
              </div>
              <div className="eye">
                <div className="eye-white">
                  <div className="eye-iris" />
                  <div className="eye-pupil" />
                  <div className="eye-shine" />
                </div>
                <div className="eyelash" />
              </div>
            </div>
            <div className="nose" />
            <div className="mouth" id="mouth" />
            <div className="blush left" />
            <div className="blush right" />
          </div>
          <div className="ear left" />
          <div className="ear right" />
        </div>
        <div className="star-acc">★</div>
        <div className="legs">
          <div className="leg">
            <div className="shoe" />
          </div>
          <div className="leg">
            <div className="shoe" />
          </div>
        </div>
      </div>
      <div className="particles" id="particles" />
    </div>
  );
}
