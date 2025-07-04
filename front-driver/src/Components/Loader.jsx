import { RotatingLines } from 'react-loader-spinner';

function Loader() {
  return (
    <RotatingLines
      strokeColor="white"
      strokeWidth="5"
      animationDuration="0.75"
      width="25"
      visible={true}
    />
  );
}
export default Loader;
