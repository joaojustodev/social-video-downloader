import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api, { AxiosError } from "axios";
import { VideoEntity } from "../../entity/VideoEntity";

interface fetchVideoResponseError {
  message: string | undefined;
  status: number | undefined;
  ok: boolean;
}

export const fetchVideo = createAsyncThunk<
  VideoEntity,
  string,
  { rejectValue: fetchVideoResponseError }
>("video/fetchVideo", async (url, { rejectWithValue }) => {
  const response = await api
    .post<VideoEntity>(`/api/video`, {
      url,
    })
    .then((r) => r.data)
    .catch((err: AxiosError<{ error: string }>) => {
      const res = err.response;

      let error = {
        message: res?.data.error,
        status: res?.status,
        ok: true,
      };

      return rejectWithValue(error);
    });

  return response;
});

const errorInitialState: fetchVideoResponseError = {
  ok: false,
  message: "",
  status: 0,
};

interface fetchVideoState {
  success: boolean;
  loading: boolean;
  error: fetchVideoResponseError | undefined;
  data: VideoEntity | null;
}

export const fetchVideoSlice = createSlice({
  name: "video",
  initialState: {
    success: false,
    loading: false,
    error: errorInitialState,
    data: null,
  } as fetchVideoState,
  reducers: {
    cleanVideo: (state) => {
      state.data = null;
    },
  },
  extraReducers: ({ addCase }) => {
    addCase(fetchVideo.pending, (state) => {
      state.loading = true;
      state.error = errorInitialState;
      state.success = false;
      state.data = null;
    });

    addCase(fetchVideo.rejected, (state, action) => {
      state.error = action?.payload;
      state.loading = false;
      state.success = false;
      state.data = null;
    });

    addCase(
      fetchVideo.fulfilled,
      (state, action: PayloadAction<VideoEntity>) => {
        state.success = true;
        state.loading = false;
        (state.error = errorInitialState), (state.data = action.payload);
      }
    );
  },
});

export const { cleanVideo } = fetchVideoSlice.actions;

export default fetchVideoSlice.reducer;
