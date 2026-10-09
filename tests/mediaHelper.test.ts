import { describe, expect, it } from "bun:test";
import {
  isVideoMedia,
  isImageMedia,
  countMediaTypes,
  validateProjectMedia,
  MAX_PROJECT_IMAGES,
  MAX_PROJECT_VIDEOS,
} from "../src/lib/mediaHelper";

describe("Media Helper & Project Quota Rules", () => {
  it("should correctly identify image files vs video files", () => {
    expect(isImageMedia("/uploads/photo.jpg")).toBe(true);
    expect(isImageMedia("/uploads/screenshot.png")).toBe(true);
    expect(isImageMedia("/uploads/banner.webp")).toBe(true);
    expect(isImageMedia("/uploads/diagram.svg")).toBe(true);
    expect(isVideoMedia("/uploads/photo.jpg")).toBe(false);

    expect(isVideoMedia("/uploads/demo.mp4")).toBe(true);
    expect(isVideoMedia("/uploads/screen.webm")).toBe(true);
    expect(isVideoMedia("/uploads/clip.mov")).toBe(true);
    expect(isVideoMedia("data:video/mp4;base64,AAAA")).toBe(true);
    expect(isImageMedia("/uploads/demo.mp4")).toBe(false);
  });

  it("should count images and videos accurately in mixed lists", () => {
    const mixed = [
      "/uploads/img1.webp",
      "/uploads/img2.webp",
      "/uploads/demo.mp4",
      "/uploads/img3.webp",
    ];
    const { imageCount, videoCount } = countMediaTypes(mixed);
    expect(imageCount).toBe(3);
    expect(videoCount).toBe(1);
  });

  it("should validate allowed projects with at most 5 images and 1 video", () => {
    const valid1 = [
      "/uploads/img1.webp",
      "/uploads/img2.webp",
      "/uploads/img3.webp",
      "/uploads/img4.webp",
      "/uploads/img5.webp",
    ];
    expect(validateProjectMedia(valid1).valid).toBe(true);

    const valid2WithVideo = [
      "/uploads/img1.webp",
      "/uploads/img2.webp",
      "/uploads/demo.mp4",
    ];
    const res = validateProjectMedia(valid2WithVideo);
    expect(res.valid).toBe(true);
    expect(res.imageCount).toBe(2);
    expect(res.videoCount).toBe(1);
  });

  it("should reject projects exceeding 5 images", () => {
    const tooManyImages = [
      "/uploads/1.jpg",
      "/uploads/2.jpg",
      "/uploads/3.jpg",
      "/uploads/4.jpg",
      "/uploads/5.jpg",
      "/uploads/6.jpg",
    ];
    const res = validateProjectMedia(tooManyImages);
    expect(res.valid).toBe(false);
    expect(res.error).toContain(`maximum of ${MAX_PROJECT_IMAGES} images`);
  });

  it("should reject projects exceeding 1 video", () => {
    const tooManyVideos = [
      "/uploads/demo1.mp4",
      "/uploads/demo2.mp4",
      "/uploads/image.webp",
    ];
    const res = validateProjectMedia(tooManyVideos);
    expect(res.valid).toBe(false);
    expect(res.error).toContain(`at most ${MAX_PROJECT_VIDEOS} video`);
  });
});
