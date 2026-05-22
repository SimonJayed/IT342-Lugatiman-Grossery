package edu.cit.lugatiman.grossery.features.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendWelcomeEmail(String to, String name) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Welcome to Grossery!");
        message.setText("Hi " + name + ",\n\nWelcome to Grossery! Start tracking your grocery consumption today to minimize waste and maximize savings.\n\nBest,\nGrossery Team");
        mailSender.send(message);
    }

    @Async
    public void sendExpiryAlert(String to, String itemName, String date) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Grossery Alert: Expiring Soon!");
        message.setText("Hi there,\n\nJust a quick heads up that your " + itemName + " is expiring on " + date + ". Be sure to consume it before it goes bad!\n\nBest,\nGrossery Team");
        mailSender.send(message);
    }

    @Async
    public void sendOverconsumptionAlert(String to, String itemName, double actual, double expected) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Grossery Alert: Overconsumption Detected");
        message.setText("Hi there,\n\nWe noticed that your consumption for " + itemName + " this month (" + actual + ") has exceeded your expected target (" + expected + ").\nConsider adjusting your usage or your targets for next month.\n\nBest,\nGrossery Team");
        mailSender.send(message);
    }
}
