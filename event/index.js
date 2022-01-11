const { EventEmitter } = require("events");
const { mailNoReplyDispatcher, mailInfoDispatcher } = require("../util");
const { replyTemplate } = require("../util/templates");
const eventManager = new EventEmitter();
const { adminEmail } = require("../config");
const { replyTemplateAdmin } = require("../util/templatesAdmin");

eventManager.on("new_booking", async (payload) => {
  try {
    const to = payload.user.email;
    const message = `Dear ${payload.user.firstName} ${payload.user.lastName}, <br>

        <p>Your booking for ${payload.service} is confirmed.<p><br>

        <p>We are looking forward to welcoming you to at ${payload.userCenter} at ${payload.state}, ${payload.country}, on ${payload.date} at ${payload.time}.<p><br>

        <p>Your unique ID is ${payload.user.userId}.</p><br>

        <p>If, for any reason, you can’t make the appointment, please let us know as soon as possible.</p><br>

        You can also use google maps (shortcode or link) to locate the center: ${payload.location}<br>

        <p>Kind regards,</p><br>

        <p>Pandus Powell | Ficoven Investment Limited.</p><br>        

        <p>${payload.agentNumber}<br></p>
        
        <p>https://nin-panduspowells.ficoven.com/</p><br>
        
        Thank you for choosing Pandus Powell | Ficoven Investment Limited.<br>
        `;
    const html = await replyTemplate(message);
    const options = {
      to,
      html,
      subject: "Your appointment information",
    };
    await mailNoReplyDispatcher(options);
  } catch (error) {}
});

eventManager.on("new_booking", async (payload) => {
  try {
    const to = adminEmail;
    const message = `<p>Hello Admin.</p>

        <p>You have a new booking.<p>
        
        <p>Service: ${payload.service}</p>
        <p>Service Charge: $${payload.totalAmount}</p>
        <p>Date: ${payload.date}</p>
        <p>Time: ${payload.time}</p>
        <p>Client name: ${payload.user.firstName} ${payload.user.lastName}</p>
        <p>Client phone: ${payload.user.phoneNumber}</p>
        <p>Client email: ${payload.user.email}</p>
        <p>Client unique ID is: ${payload.user.userId}</p>`;
    const html = await replyTemplate(message);
    const options = {
      to,
      html,
      subject: "New booking notification",
    };
    await mailInfoDispatcher(options);
  } catch (error) {}
});

eventManager.on("booking_updated", async (payload) => {
  try {
    if (payload.notification) {
      const to = payload.user.email;
      const message = `Dear ${payload.user.firstName} ${payload.user.lastName}, <br>

        This is a notification that your booking for ${payload.service} has been modified.<br>
        
        Enrolment Center: ${payload.userCenter},<br>
        Date: ${payload.date} <br>
        Time: ${payload.time}.<br>
        Status: ${payload.status}<br>
        Your unique ID is ${payload.user.userId}.<br>
        
        Thank you for choosing Pandus Powell | Ficoven Investment Limited.<br>
        
      
        070 2018 9053<br>
        https://nin-panduspowells.ficoven.com/`;
      const html = await replyTemplate(message);
      const options = {
        to,
        html,
        subject: "Your booking has been updated",
      };
      await mailNoReplyDispatcher(options);
    }
  } catch (error) {}
});

eventManager.on("booking_updated", async (payload) => {
  try {
    if (payload.notification) {
      const to = adminEmail;
      const message = `Hello Admin, <br>
  
          This is a notification that booking for ${payload.user.firstName} ${payload.user.lastName}, with ID ${payload.user.userId} has been modified.<br>

          Internal Note: ${payload.message}<br>
          
          Enrolment Center: ${payload.userCenter},<br>
          Date: ${payload.date} <br>
          Time: ${payload.time}.<br>
          Status: ${payload.status}<br>

          Edited by:
          Name: ${payload.admin.name} <br>
          Email: ${payload.admin.email}.<br>
          Country: ${payload.admin.country}.<br>
          Role: ${payload.admin.role}.

          
          https://nin-panduspowells.ficoven.com/`;
      const html = await replyTemplate(message);
      const options = {
        to,
        html,
        subject: `${payload.user.firstName} Booking has been updated`,
      };
      await mailInfoDispatcher(options);
    }
  } catch (error) {}
});

eventManager.on("booking_deleted", async (payload) => {
  try {
    const to = adminEmail;
    const message = `Hello Admin, <br>
  
          This is a notification that a client ${payload.user.firstName} ${payload.user.lastName}, with ID ${payload.user.userId} has been deleted. Find below the details<br>
          
        <p>Client name: ${payload.user.firstName} ${payload.user.lastName}</p>
        <p>Service: ${payload.service}</p>
        <p>Service charge: ${payload.amount}</p>
        <p>Service Category: ${payload.category}</p>
        <p>Enrolment Center: ${payload.userCenter}, ${payload.country}</p>
        <p>Initial Booking Date: ${payload.date}</p>
        <p>Initial Appointment Time: ${payload.time}</p><br>
        
        <p>Client phone: ${payload.user.phoneNumber}</p>
        <p>Client email: ${payload.user.email}</p>
        <p>Client Country, State, City, & Address: ${payload.user.country}, ${payload.user.state}, ${payload.user.city}, ${payload.user.streetAddress}</p>
        <p>Client unique ID is: ${payload.user.userId}</p><br>

        Deleted by:
          Name: ${payload.admin.name} <br>
          Email: ${payload.admin.email}.<br>
          Country: ${payload.admin.country}.<br>
          Role: ${payload.admin.role}.<br>

        
          
          https://nin-panduspowells.ficoven.com/`;
    const html = await replyTemplate(message);
    const options = {
      to,
      html,
      subject: `${payload.user.firstName} booking has been deleted`,
    };
    const result = await mailInfoDispatcher(options);
  } catch (error) {}
});

eventManager.on("service_deleted", async (payload) => {
  try {
    const to = adminEmail;
    const message = `Hello Admin, <br>
  
          This is a notification that a ${payload.name} has been deleted. Find below the details<br>
          
        <p>Service charge: $${payload.amount}</p>
        <p>Service Category: ${payload.category}</p>

        Deleted by:
          Name: ${payload.admin.name} <br>
          Email: ${payload.admin.email}.<br>
          Country: ${payload.admin.country}.<br>
          Role: ${payload.admin.role}.<br>

        
          
          https://nin-panduspowells.ficoven.com/`;
    const html = await replyTemplate(message);
    const options = {
      to,
      html,
      subject: `${payload.name} service has been deleted`,
    };
    await mailInfoDispatcher(options);
  } catch (error) {}
});

eventManager.on("service_updated", async (payload) => {
  try {
    const to = adminEmail;
    const message = `Hello Admin, <br>
  
          This is a notification that  ${payload.name} has been modified. Find below the details<br>
          
        <p>Service charge: $${payload.amount}</p>
        <p>Service Category: ${payload.category}</p>

        Edited by:
          Name: ${payload.admin.name} <br>
          Email: ${payload.admin.email}.<br>
          Country: ${payload.admin.country}.<br>
          Role: ${payload.admin.role}.

        
          
          https://nin-panduspowells.ficoven.com/`;
    const html = await replyTemplate(message);
    const options = {
      to,
      html,
      subject: `${payload.name} service has been updated`,
    };
    await mailInfoDispatcher(options);
  } catch (error) {}
});

eventManager.on("center_updated", async (payload) => {
  try {
    const to = adminEmail;
    const message = `Hello Admin, <br>
  
          This is a notification that ${payload.name} (Enrolment Center) has been modified. Find below the details<br>
          
        <p>Center Name: ${payload.name}</p>
        <p>Center ID: ${payload._id}</p>
        <p>Center Address: ${payload.address}</p>
        <p>Center Google location: ${payload.location}</p>
        <p>Center Country Code: ${payload.countryCode}</p>

        Edited by:
          Name: ${payload.admin.name} <br>
          Email: ${payload.admin.email}.<br>
          Country: ${payload.admin.country}.<br>
          Role: ${payload.admin.role}.<br>

        
          
          https://nin-panduspowells.ficoven.com/`;
    const html = await replyTemplate(message);
    const options = {
      to,
      html,
      subject: `${payload.name} center has been updated`,
    };
    await mailInfoDispatcher(options);
  } catch (error) {}
});

eventManager.on("center_deleted", async (payload) => {
  try {
    const to = adminEmail;
    const message = `Hello Admin, <br>
  
      This is a notification that ${payload.name} (Enrolment Center) has been deleted. Find below the details<br>
          
      <p>Center Name: ${payload.name}</p>
      <p>Center ID: ${payload._id}</p>
      <p>Center Address: ${payload.address}</p>
      <p>Center Google location: ${payload.location}</p>
      <p>Center Country Code: ${payload.countryCode}</p>

        Deleted by:
          Name: ${payload.admin.name} <br>
          Email: ${payload.admin.email}.<br>
          Country: ${payload.admin.country}.<br>
          Role: ${payload.admin.role}.<br>

        
          
          https://nin-panduspowells.ficoven.com/`;
    const html = await replyTemplate(message);
    const options = {
      to,
      html,
      subject: `${payload.name} center has been deleted`,
    };
    await mailInfoDispatcher(options);
  } catch (error) {}
});

//Handling users delete event
eventManager.on("user_deleted", async (payload) => {
  try {
    const to = adminEmail;
    const message = `Hello Admin, <br>
  
          This is a notification that a ${payload.name} has been deleted. Find below the details<br>
          
        <p>Admin Name: ${payload.name}</p>
        <p>Admin Email: ${payload.email}</p>

        Deleted by:
          Name: ${payload.admin.name} <br>
          Email: ${payload.admin.email}.<br>
          Country: ${payload.admin.country}.<br>
          Role: ${payload.admin.role}.<br>

        
          
          https://nin-panduspowells.ficoven.com/`;
    const html = await replyTemplate(message);
    const options = {
      to,
      html,
      subject: `${payload.name} User has been deleted`,
    };
    await mailInfoDispatcher(options);
  } catch (error) {}
});

eventManager.on("admin_user_created", async (payload) => {
  try {
    const to = payload.email;
    const message = `Hello ${payload.name}, <br>
  
          This is to notify you that you have been added as a new admin on NIN Ficoven | Panduspowells platform. Find below your details:<br>
          
        <p>Full Name: ${payload.name}</p>
        <p>Email: ${payload.email}</p>
        <p>Password: ${payload.password}</p>
        <p>Country: ${payload.country}</p>
        <p>Role: ${payload.role}.<br></p>
        
        Visit  https://portal.ficoven.com/login to login using your email and password above`;
    const html = await replyTemplateAdmin(message);
    const options = {
      to,
      html,
      subject: `${payload.name}, you have been added as an admin`,
    };
    const result = await mailInfoDispatcher(options);
  } catch (error) {}
});

module.exports = eventManager;
