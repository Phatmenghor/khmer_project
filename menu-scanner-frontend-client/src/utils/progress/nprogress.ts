let NProgressModule: any = null;


const initNProgress = async () => {
  if (!NProgressModule) {
    NProgressModule = await import("nprogress");
  }
  return NProgressModule.default;
};


export const startProgress = async () => {
  const NProgress = await initNProgress();
  NProgress.start();
};

export const stopProgress = async () => {
  const NProgress = await initNProgress();
  NProgress.done();
};

export const incrementProgress = async (amount?: number) => {
  const NProgress = await initNProgress();
  NProgress.inc(amount);
};


export const useGlobalProgress = () => {
  return {
    start: startProgress,
    stop: stopProgress,
    increment: incrementProgress,
  };
};


export const withProgress = async <T>(
  asyncFn: () => Promise<T>,
  options?: { autoStart?: boolean; autoStop?: boolean }
): Promise<T> => {
  const { autoStart = true, autoStop = true } = options || {};

  try {
    if (autoStart) await startProgress();
    const result = await asyncFn();
    return result;
  } finally {
    if (autoStop) await stopProgress();
  }
};


const nextConfig = {
  webpack: (config: any) => {

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
