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
	
	private EmailServiceClient(String accessKey, String secretKey, String region) {
		BasicAWSCredentials creds = new BasicAWSCredentials(accessKey, secretKey);
		AWSStaticCredentialsProvider credentialsProvider = new AWSStaticCredentialsProvider(creds);
		client = AmazonSimpleEmailServiceClientBuilder.standard().withCredentials(credentialsProvider).withRegion(region).build();
		
	}
	
	public static EmailServiceClient getInstance(String accessKey, String secretKey, String region) {
		return new EmailServiceClient(accessKey, secretKey, region);
	}
	
	public void sendWelcomeEmail(String template_name, String email, String firstlook_url, String stratos_url) {
		
		Destination destination = new Destination().withToAddresses(email);
		SendTemplatedEmailRequest req = new SendTemplatedEmailRequest()
				.withDestination(destination)
				.withTemplate(template_name)
				.withTemplateData("{}");
		
		client.sendTemplatedEmail(req);
	}
}
