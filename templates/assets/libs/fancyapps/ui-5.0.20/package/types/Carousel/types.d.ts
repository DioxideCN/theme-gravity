export interface slideType {
    html: string;
    el: HTMLElement | null;
    isDom: boolean;
    class: string;
    index: number;
    dim: number;
    gap: number;
    pos: number;
    transition: string | false;
    thumb?: string | HTMLImageElement;
    thumbSrc?: string;
    thumbElSrc?: string;
    thumbEl?: HTMLImageElement;
}
import { Constructor } from "../shared/Base/types";
import { Plugin } from "../shared/Base/Plugin";
import { Carousel } from "./Carousel";
export type PluginsType = Record<string, Constructor<Plugin<Carousel, any, any>>>;
export type userSlideType = String | HTMLElement | Partial<slideType>;
export type pageType = {
    index: number;
    slides: Array<slideType>;
    dim: number;
    pos: number;
};
import { ComponentEventsType } from "../shared/Base/types";
import { EventsType as PanzoomEventsType } from "../Panzoom/types";
export type CarouselEventsType = ComponentEventsType
/**
 * Initialization has started, plugins have been added
 */
 | "init"
/**
 * The layout is initialized
 */
 | "initLayout"
/**
 * A slide object is created
 */
 | "initSlide"
/**
 * All slides have objects created
 */
 | "initSlides"
/**
 * A corresponding DOM element is created for the slide
 */
 | "createSlide"
/**
 * The element corresponding to the slide is removed from the DOM
 */
 | "removeSlide"
/**
 * Slide is marked as being on the active page
 */
 | "selectSlide"
/**
 * Slide is no longer on the active page
 */
 | "unselectSlide"
/**
 * Initialization has been completed
 */
 | "ready"
/**
 * Carousel metrics have been updated
 */
 | "refresh"
/**
 * The active page of the carousel is changed
 */
 | "change"
/**
 * Single click event has been detected
 */
 | "click"
/**
 * The image is lazy loaded
 */
 | "load"
/**
 * The slide change animation has finished
 */
 | "settle" | `Panzoom.${PanzoomEventsType}`;
export type Events = Record<CarouselEventsType, (...args: any[]) => void>;
