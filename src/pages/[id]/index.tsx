import { useParams, useSearchParams } from "react-router-dom";
import App from "../../UI/App";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import Box from "@mui/material/Box";
import { applyLocalConfig, setLiveId, setTheme, setLiveType, setPumpRoom } from "../../store/configSlice";
import { colorToString } from "../../paid/theme";

export default function () {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const theme = searchParams.get("theme");
  const liveType = searchParams.get("liveType");
  const pumpRoom = searchParams.get("pumpRoom");
  const bilibiliCode = searchParams.get('Code') || searchParams.get('code')
  // @ts-ignore
  window.bilibiliCode = bilibiliCode;
  dispatch(setLiveId(parseInt(id as string)));
  dispatch(setTheme(theme));
  if (liveType) {
    // @ts-ignore
    dispatch(setLiveType(liveType));
  }
  if (pumpRoom) {
    // @ts-ignore
    dispatch(setPumpRoom(pumpRoom));
  }
  dispatch(applyLocalConfig());

  const { liveId } = useSelector((state: RootState) => state.config);
  const { styleTheme } = useSelector((state: RootState) => state.config);
  const { theme: themeClassName } = useSelector(
    (state: RootState) => state.config
  );
  return (
    <Box
      className={themeClassName}
      sx={{
        backgroundColor: colorToString(styleTheme.backgroundColor, "#ebffe2"),
        color: colorToString(styleTheme.textColor, "#000000"),
      }}
    >
      <Box
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          display: `${liveId === 1439885 ? "none" : "block"}`,
          fontSize: "0.8em",
        }}
      >
        @Ke_Jun 已授权
      </Box>
      <App />
    </Box>
  );
}
