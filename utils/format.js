export const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export const formatEventMessage = (event) => {
  return `<b>${event.title}</b>
    \n${event.description}
    \n📍${event.location}
    \n📆${formatDate(event.date)}
    \n${event.tags.map((el) => `#${el}`).join(" ")}`;
};

export const formatUserEvents = (userEvents) => {
  let text = "<b>ЗБЕРЕЖЕНІ ПОДІЇ:</b>\n\n";
  for (let i = 0; i < userEvents.length; i++) {
    text += `${i + 1}. <a href="${userEvents[i].link}">${
      userEvents[i].title
    }</a>
    \t📍${userEvents[i].location}
    \t📆${formatDate(userEvents[i].date)}\n\n`;
  }
  return text;
};
