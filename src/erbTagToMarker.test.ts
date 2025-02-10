import { expect, test } from "@jest/globals";
import erbTagToMarker from "./erbTagToMarker"

test("erb tag to marker", () => {
  expect(erbTagToMarker("<% test %>")).toEqual(`<erb data-eruby-content="${encodeURIComponent("<% test %>")}" />`);
  expect(erbTagToMarker("<%= test %>")).toEqual(`<erb data-eruby-content="${encodeURIComponent("<%= test %>")}" />`);
  expect(erbTagToMarker("<%- test %>")).toEqual(`<erb data-eruby-content="${encodeURIComponent("<%- test %>")}" />`);
});

test("block erb tag to marker", () => {
  expect(erbTagToMarker("<% form_with do %>")).toEqual(`<erb data-eruby-content="${encodeURIComponent("<% form_with do %>")}">`);
  expect(erbTagToMarker("<%= form_with do %>")).toEqual(`<erb data-eruby-content="${encodeURIComponent("<%= form_with do %>")}">`);
  expect(erbTagToMarker("<%- form_with do %>")).toEqual(`<erb data-eruby-content="${encodeURIComponent("<%- form_with do %>")}">`);
});

test("end erb tag to marker", () => {
  expect(erbTagToMarker("<% end %>")).toEqual("<erb-end>");
});

test("if erb tag to marker", () => {
  expect(erbTagToMarker("<% if test %>")).toEqual(`<erb data-eruby-content="${encodeURIComponent("<% if test %>")}">`);
  expect(erbTagToMarker("<%= if test %>")).toEqual(`<erb data-eruby-content="${encodeURIComponent("<%= if test %>")}">`);
  expect(erbTagToMarker("<%- if test %>")).toEqual(`<erb data-eruby-content="${encodeURIComponent("<%- if test %>")}">`);
});
