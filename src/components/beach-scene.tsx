/**
 * Aerial beach scene — SVG approximation used as the destination of the morph transition.
 * Ocean (deep teal/green) + white foam waves + sandy beach, aerial perspective.
 */
import { useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Ellipse } from 'react-native-svg';

export function BeachScene() {
  const { width, height } = useWindowDimensions();
  const waveY = height * 0.52;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="ocean" x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0"   stopColor="#0D3326" />
          <Stop offset="0.4" stopColor="#1A5440" />
          <Stop offset="0.8" stopColor="#2B7A5E" />
          <Stop offset="1"   stopColor="#3A9070" />
        </LinearGradient>
        <LinearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor="#C8AA88" />
          <Stop offset="0.5" stopColor="#BFA07C" />
          <Stop offset="1"   stopColor="#B89068" />
        </LinearGradient>
        <LinearGradient id="shallows" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3DA882" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#5CC49A" stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Ocean base */}
      <Rect x="0" y="0" width={width} height={height} fill="url(#ocean)" />

      {/* Shallow water near shore */}
      <Path
        d={`
          M 0 ${waveY - 60}
          Q ${width * 0.3} ${waveY - 100} ${width * 0.6} ${waveY - 60}
          Q ${width * 0.85} ${waveY - 20} ${width} ${waveY - 50}
          L ${width} ${waveY + 80}
          Q ${width * 0.7} ${waveY + 60} ${width * 0.4} ${waveY + 100}
          Q ${width * 0.15} ${waveY + 120} 0 ${waveY + 60}
          Z
        `}
        fill="url(#shallows)"
      />

      {/* Sandy beach */}
      <Path
        d={`
          M 0 ${waveY + 40}
          Q ${width * 0.2} ${waveY - 10} ${width * 0.45} ${waveY + 30}
          Q ${width * 0.7}  ${waveY + 70} ${width}   ${waveY + 10}
          L ${width} ${height}
          L 0 ${height}
          Z
        `}
        fill="url(#sand)"
      />

      {/* Main wave break — thick white foam */}
      <Path
        d={`
          M -20 ${waveY + 25}
          Q ${width * 0.15} ${waveY - 30} ${width * 0.38} ${waveY + 10}
          Q ${width * 0.6}  ${waveY + 45} ${width * 0.8} ${waveY + 5}
          Q ${width * 0.92} ${waveY - 15} ${width + 20} ${waveY - 5}
        `}
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={14}
        strokeLinecap="round"
      />

      {/* Secondary wave — lighter */}
      <Path
        d={`
          M -20 ${waveY - 40}
          Q ${width * 0.25} ${waveY - 80} ${width * 0.55} ${waveY - 45}
          Q ${width * 0.75} ${waveY - 20} ${width + 20} ${waveY - 55}
        `}
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth={10}
        strokeLinecap="round"
      />

      {/* Distant wave — very faint */}
      <Path
        d={`
          M -20 ${waveY - 100}
          Q ${width * 0.3}  ${waveY - 130} ${width * 0.65} ${waveY - 95}
          Q ${width * 0.82} ${waveY - 75}  ${width + 20}   ${waveY - 110}
        `}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={7}
        strokeLinecap="round"
      />

      {/* Foam scatter dots */}
      {([
        [width * 0.12, waveY + 8],
        [width * 0.28, waveY + 18],
        [width * 0.5,  waveY + 28],
        [width * 0.68, waveY + 12],
        [width * 0.85, waveY + 5],
      ] as [number, number][]).map(([cx, cy], i) => (
        <Ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={14 + i * 3}
          ry={5 + i}
          fill="rgba(255,255,255,0.3)"
        />
      ))}
    </Svg>
  );
}
