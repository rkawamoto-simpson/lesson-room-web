export default BackgroundFilter;
declare class BackgroundFilter {
     /**
     * @description Return a webgl context based on the config
     *
     * @param {MediaStream|MediaStreamTrack|HTMLMediaElement} input Input to the BackgroundFilter; Either a MediaStream object from getUserMedia or a MediaStreamTrack which is a video track or a video tag
     * @param {object} params
     * @param {string} [params.token] - Token used to fetch models from server; Signup on <a href="https://ai-filters.vectorly.io/#/signup/">Vectorly dashboard</a> to get the token
     * @param {string} [params.model] - Model to use. Options are
     * </br> "selfie" : Mediapipe segmentation
     * </br> "selfie_v2": Mediapipe segmentation version 2
     * </br> "webgl" : WebGL implementation
     * </br> "webgl_v2" : WebGL implementation version 2
     * @param {string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData } [params.background=https://files.vectorly.io/demo/videocall/virtual-background.png] -
     * For background blur, provide the string "blur".
     * <br/>For Virtual Background Images, provide  the String of URL of background image to use, or any type of Image source supported by [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap)
     * <br/>For transparent background provide the string "transparent"
     * @param {number} [params.blurRadius=5] - Value of blur radius to use, typically set as a value between [1, 10];
     * @param {number} [params.frameRate=30] - Framerate used for running the virtual background filter
     * @param {number} [params.segmentationFrameRate=15] - Target frame rate for running segmentation
     * @param {boolean} [params.passthrough=false] - If set to true; calling disable will pass the input directly through to the output MediaStream so that you can call disable/enable without changing the output MediaStream object. Default is false, in which case the output MediaStream stops when disable is called. segmentationFrameRate is set to the nearest
     * @param {boolean} [params.debug=false]
     *
     */
    constructor(input: MediaStream | MediaStreamTrack | HTMLMediaElement, params: {
        token?: string;
        model?: string;
        background?: string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData;
        blurRadius?: number;
        frameRate?: number;
        analyticsEnabled?: boolean;
        segmentationFrameRate?: number;
        passthrough?: boolean;
        debug?: boolean;
    });
    times: {
        ref: number;
    };
    type: string;
    params: {
        token?: string;
        model?: string;
        background?: string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData;
        blurRadius?: number;
        analyticsEnabled?: boolean;
        frameRate?: number;
        segmentationFrameRate?: number;
        passthrough?: boolean;
        debug?: boolean;
    };
    model: string;
    model_version: any;
    enableOffscreen: boolean;
    debug: any;
    id: any;
    version: any;
    serverType: any;
    defaults: {};
    frameRate: any;
    segmentationFrameRate: any;
    passthrough: boolean;
    defaultBackground: string;
    defaultBlurRadius: number;
    background: string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData;
    blurRadius: number;
    error: any;
    loadP: Promise<boolean>;
    input: any;
    inputClone: any;
    video: HTMLVideoElement;
    processorP: Promise<{
        canvas: HTMLCanvasElement;
        processor: any;
    }>;
    outputP: Promise<any>;
    inputCheck(input: any, params: any): void;
    loadCore(enableOffscreen: any): Promise<boolean>;
    checkSupport(enableOffscreen: any): boolean;
    registerInputListeners(): void;
    _getInput(input: MediaStream | MediaStreamTrack | HTMLMediaElement): any;
    originalInput: MediaStream | MediaStreamTrack;
    _initializeCoreNetwork(): Promise<{
        canvas: HTMLCanvasElement;
        processor: any;
    }>;
    _getBackground(background: string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData): {
        type: string;
        radius: number;
        image?: string;
    } | {
        type: string;
        image: any;
        radius?: number;
    };
    _getBlurRadius(blurRadius: number): {
        type: string;
        radius: number;
    };
    /**
     * async changeBackground - Change the background used in the filter
     *
   * @param {string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData } [https://files.vectorly.io/demo/videocall/virtual-background.png] - For background blur, provide the string "blur". For Virtual Background Images, provide  the String of URL of background image to use, or any type of Image source supported by [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap)
     */
    changeBackground(background?: string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData): Promise<void>;
    /**
     * @typedef {object} BackgroundFilter~frameRateSetting
     * @property {number} frameRate - frameRate at which the filter is run
     * @property {number} segmentationFrameRate - frameRate at which the segmentation is run
     *
     */
    /**
     * async requestFrameRate - Try to Change the framerate used in the filter. The return value gives the actual frameRateSetting values set, based on constraints of the track.
     *
     * @param {object} setting - Framerate to be used for running the virtual background filter
     * @param {number} [setting.frameRate=30] - Framerate used for running the virtual background filter. If set to higher than the input MediaStreamTrack's frameRate, it defaults to the track's frameRate
     * @param {number} [setting.segmentationFrameRate=15] - Target framerate for running Segmentation. If set to higher than frameRate; it will be default to frameRate.
     * @return {BackgroundFilter~frameRateSetting} Returns the actual {@link BackgroundFilter~frameRateSetting|frameRate and segmentationFrameRate} that was set
     */
    requestFrameRate({ frameRate, segmentationFrameRate }: {
        frameRate?: number;
        segmentationFrameRate?: number;
    }): BackgroundFilter;
    /**
     * async changeBlurRadius - Change the radius to increase or decrease blur strength
     *
     * @param {Number} [blurRadius=5] - Value of blur radius to use, typically set as a value between [1, 10];
     */
    changeBlurRadius(blurRadius?: number): Promise<void>;
    _createNewStream(): Promise<any>;
    canvas: HTMLCanvasElement;
    processor: any;
    processOutput: MediaStream;
    output: MediaStream;
    /**
     * async getOutput - Get the output MediaStream
     *
     * @return {MediaStream}  Outputs MediaStream object which is the processed input stream with the background filter applied
     */
    getOutput(): Promise<MediaStream>;
    /**
     * async getOutputTrack - Get the output MediaStreamTrack
     *
     * @return {MediaStreamTrack}  Outputs MediaStreamTrack object which is the processed input video track with the background filter applied
     */
    getOutputTrack(): Promise<MediaStreamTrack>;
    /**
     * disable - Disables background filter processing. Returns input stream as a new MediaStream object
     *
     * @return {MediaStream}  Outputs the input MediaStream object with no filter applies
     */
    disable(): Promise<MediaStream>;
    /**
     * enable - Enables background filter processing. Returns processed output stream as a MediaStream object
     *
     * @return {MediaStream}  Outputs MediaStream object which is the processed input stream with the background filter applied
     */
    enable(): Promise<MediaStream>;
    _initVideo(): HTMLVideoElement;
    _getVideoTrack(input: any): MediaStreamTrack;
    _isSameTrack(input1: any, input2: any): boolean;
    /**
     * async changeInput - Change the input to the background filter
     *
     * @param {MediaStream|MediaStreamTrack|HTMLMediaElement} input Input to the BackgroundFilter; Either a MediaStream object from getUserMedia or a video tag
     */
    changeInput(input: MediaStream | MediaStreamTrack | HTMLMediaElement): Promise<void>;
    stop(): void;
    log(...args: any[]): void;
    /**
     * isSupported - Get whether current browser is supported and if so, list of features supported by the current browser
     *
     * features object returned has following attributes: </br>
     * - `wasm`: Is WebAssembly supported? WebAssembly support is required for BackgroundFilter to work </br>
     * - `simd`: Is SIMD supported in WebAssembly? SIMD support reduces CPU usage but isn't necessary </br>
     * - `webgl1`: Is WebGL1 supported? </br>
     * - `webgl2`, Is WebGL2 supported? </br>
     * - `offscreen`: Is OffscreenCanvas supported? OffscreenCanvas support lets the camera feed process in the background even when the current tab is hidden </br>
     *
     * @return {boolean | object}  Returns false if the background filter can not be run at all. Returns current browser's support for a list of features if it can be run.
     *
     */
    static isSupported(): boolean | object;
}
