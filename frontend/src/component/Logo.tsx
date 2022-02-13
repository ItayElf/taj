interface Props {
  width?: number;
  height?: number;
}

export default function Logo({ width, height }: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M19.472 10.907L19.325 6.212L19.25 4.56C19.26 4.509 19.274 4.407 19.229 4.308C19.176 4.198 19.057 4.126 18.977 4.083C18.961 3.763 18.935 3.532 18.9 3.532C18.866 3.532 18.838 3.759 18.825 4.079C18.745 4.12 18.622 4.196 18.568 4.308C18.522 4.407 18.54 4.509 18.549 4.56L18.326 10.909H17.141L16.99 6.159C16.99 6.159 16.994 5.976 16.959 5.905C16.924 5.831 16.855 5.784 16.795 5.751C16.785 5.376 16.754 5.089 16.719 5.089C16.68 5.089 16.651 5.368 16.64 5.739C16.578 5.769 16.494 5.823 16.453 5.905C16.422 5.976 16.422 6.159 16.422 6.159L16.275 10.907H15.247V7.507L15.157 7.497V6.851H14.519V7.427L13.913 7.423H13.843V6.435H13.634C13.632 6.355 13.61 6.185 13.46 5.999C13.319 5.825 13.098 5.696 12.966 5.63C12.96 5.198 12.917 4.857 12.862 4.857C12.809 4.857 12.767 5.195 12.758 5.624C12.629 5.684 12.395 5.815 12.244 6C12.213 6.037 12.188 6.078 12.168 6.112V5.945H11.893C11.993 5.855 12.894 4.978 12.743 4.025C12.596 3.095 11.686 2.523 10.966 2.011C10.468 1.66 10.201 1.416 10.061 1.221H10.041C10.048 1.117 10.052 1.002 10.052 0.883C10.052 0.455 10.002 0.112 9.945 0.033V0.0279999C9.934 0.0189999 9.929 0 9.921 0H9.919H9.917C9.912 0 9.904 0.0199999 9.896 0.0279999V0.033C9.834 0.112 9.789 0.455 9.789 0.883C9.789 1.002 9.792 1.115 9.8 1.221H9.778C9.64 1.416 9.371 1.66 8.872 2.011C8.153 2.522 7.245 3.095 7.097 4.024C6.946 4.977 7.848 5.854 7.947 5.944H7.671V6.112C7.648 6.079 7.626 6.037 7.594 6.001C7.446 5.815 7.208 5.683 7.082 5.624C7.077 5.195 7.031 4.856 6.978 4.856C6.923 4.856 6.882 5.199 6.873 5.629C6.742 5.697 6.52 5.827 6.381 6.001C6.231 6.187 6.209 6.355 6.207 6.437H5.997V7.415L5.321 7.428V6.852H4.681V7.498L4.594 7.508V10.908H3.563L3.417 6.16C3.417 6.16 3.417 5.977 3.385 5.906C3.345 5.824 3.259 5.77 3.198 5.74C3.189 5.369 3.158 5.09 3.12 5.09C3.081 5.09 3.052 5.377 3.044 5.752C2.983 5.785 2.913 5.832 2.879 5.906C2.845 5.978 2.846 6.16 2.846 6.16L2.697 10.908H1.513L1.29 4.56C1.3 4.509 1.317 4.407 1.27 4.308C1.218 4.197 1.095 4.121 1.014 4.08C1.001 3.76 0.974 3.533 0.939 3.533C0.905 3.533 0.876 3.762 0.865 4.084C0.782 4.127 0.663 4.197 0.61 4.308C0.564 4.407 0.579 4.509 0.59 4.56L0.515 6.214L0.368 10.909H0V12.348H19.84V10.909H19.472V10.907ZM10.72 10.89H9.119V9.195C9.119 9.195 9.11 8.74 9.497 8.476C9.663 8.365 9.791 8.314 9.919 8.312C10.047 8.314 10.177 8.365 10.343 8.476C10.729 8.74 10.72 9.195 10.72 9.195V10.89Z"
        fill="#158D9E"
      />
    </svg>
  );
}

// export function LogoWithText() {
//   return (
//     <div className="flex items-end justify-center space-x-2 ">
//       <Logo width={75} height={75} />
//       <p className="text-primary font-cinzel text-5xl">Taj</p>
//     </div>
//   );
// }
