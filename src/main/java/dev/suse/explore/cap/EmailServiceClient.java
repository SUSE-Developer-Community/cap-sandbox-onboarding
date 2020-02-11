package dev.suse.explore.cap;

import org.springframework.stereotype.Component;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.amazonaws.services.simpleemail.model.Destination;
import com.amazonaws.services.simpleemail.model.SendTemplatedEmailRequest;

public class EmailServiceClient {
	private AmazonSimpleEmailService client;
	private String welcome_template;
	private String stratos_url;
	
	public EmailServiceClient(String accessKey, String secretKey, String region, String welcome_template, String stratos_url) {
		this.welcome_template = welcome_template;
		this.stratos_url = stratos_url;
		
		BasicAWSCredentials creds = new BasicAWSCredentials(accessKey, secretKey);
		AWSStaticCredentialsProvider credentialsProvider = new AWSStaticCredentialsProvider(creds);
		client = AmazonSimpleEmailServiceClientBuilder.standard().withCredentials(credentialsProvider).withRegion(region).build();
		
	}

	public void sendWelcomeEmail(String email, String firstlook_url) {

		
		Destination destination = new Destination().withToAddresses(email);
		SendTemplatedEmailRequest req = new SendTemplatedEmailRequest()
				.withDestination(destination)
				.withTemplate(welcome_template)
				.withTemplateData("{}");
		
		client.sendTemplatedEmail(req);
	}
}
