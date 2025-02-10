const markerToErbTag = (text: string, options: { indent: string }) => {
  const match = text.match(/<erb data-eruby-content="(.*?)" \/>/)
  if (!match) {
    throw new Error("No match");
  }

  return decodeURIComponent(match[1]).replace(/\n/g, `\n${options.indent}`);
};

export default markerToErbTag;
