import { AvatarState } from "../App";

interface AvatarProps {
  state: AvatarState;
}

export default function Avatar({ state }: AvatarProps) {
  return (
    <div className={`avatar avatar--${state}`}>
      <div className="avatar__shadow" />
      <div className="character">
        <div className="hair-back" />
        <div className="body">
          <div className="uniform-collar" />
          <div className="uniform-bow" />
          <div className="arm arm--left" />
          <div className="arm arm--right" />
        </div>
        <div className="head">
          <div className="hair-top" />
          <div className="hair-side hair-side--left" />
          <div className="hair-side hair-side--right" />
          <div className="hair-bang hair-bang--left" />
          <div className="hair-bang hair-bang--right" />
          <div className="hair-bang hair-bang--center" />
          <div className="face">
            <div className="eyes">
              <div className="eye eye--left">
                <div className="eye__white" />
                <div className="eye__iris" />
                <div className="eye__pupil" />
                <div className="eye__shine" />
                <div className="eyelash eyelash--top" />
              </div>
              <div className="eye eye--right">
                <div className="eye__white" />
                <div className="eye__iris" />
                <div className="eye__pupil" />
                <div className="eye__shine" />
                <div className="eyelash eyelash--top" />
              </div>
            </div>
            <div className={`mouth mouth--${state}`} />
            <div className="blush blush--left" />
            <div className="blush blush--right" />
            <div className="nose" />
          </div>
          <div className="ear ear--left" />
          <div className="ear ear--right" />
        </div>
        <div className="accessory-star">★</div>
        <div className="legs">
          <div className="leg leg--left">
            <div className="shoe" />
          </div>
          <div className="leg leg--right">
            <div className="shoe" />
          </div>
        </div>
      </div>
      {state === "happy" && (
        <div className="particles">
          <span className="particle">✨</span>
          <span className="particle">⭐</span>
          <span className="particle">💫</span>
        </div>
      )}
      {state === "thinking" && (
        <div className="particles">
          <span className="particle particle--thought">...</span>
        </div>
      )}
    </div>
  );
}
