package dev.suse.explore.cap;

import org.cloudfoundry.client.CloudFoundryClient;
import org.cloudfoundry.doppler.DopplerClient;
import org.cloudfoundry.operations.DefaultCloudFoundryOperations;
import org.cloudfoundry.reactor.ConnectionContext;
import org.cloudfoundry.reactor.DefaultConnectionContext;
import org.cloudfoundry.reactor.TokenProvider;
import org.cloudfoundry.reactor.client.ReactorCloudFoundryClient;
import org.cloudfoundry.reactor.doppler.ReactorDopplerClient;
import org.cloudfoundry.reactor.tokenprovider.PasswordGrantTokenProvider;
import org.cloudfoundry.reactor.uaa.ReactorUaaClient;
import org.cloudfoundry.uaa.UaaClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

import org.springframework.stereotype.Component;
@Component
public class Configuration {


	@Bean
	DefaultConnectionContext connectionContext(@Value("${CF_API}") String apiHost) {
		return DefaultConnectionContext.builder()
				.apiHost(apiHost)
				.build();
	}

	@Bean
	PasswordGrantTokenProvider tokenProvider(@Value("${CF_ADMIN_USER}") String username,
			@Value("${CF_ADMIN_PASS}") String password) {
		return PasswordGrantTokenProvider.builder()
				.password(password)
				.username(username)
				.build();
	}

	@Bean
	EmailServiceClient email(@Value("${SES_ACCESS_KEY}") String accessKey, 
			@Value("${SES_SECRET_KEY}") String secretKey, 
			@Value("${SES_REGION}") String region, 
			@Value("${SES_WELCOME_TEMPLATE}") String welcome_template, 
			@Value("${SES_SENDER}") String from_email, 
			@Value("${STRATOS_URL}") String stratos_url) {
		return new EmailServiceClient(accessKey, secretKey, region, welcome_template, stratos_url, from_email);
	}

	@Bean
	ReactorCloudFoundryClient cloudFoundryClient(ConnectionContext connectionContext, TokenProvider tokenProvider) {
		return ReactorCloudFoundryClient.builder()
				.connectionContext(connectionContext)
				.tokenProvider(tokenProvider)
				.build();
	}

	@Bean
	ReactorDopplerClient dopplerClient(ConnectionContext connectionContext, TokenProvider tokenProvider) {
		return ReactorDopplerClient.builder()
				.connectionContext(connectionContext)
				.tokenProvider(tokenProvider)
				.build();
	}

	@Bean
	ReactorUaaClient uaaClient(ConnectionContext connectionContext, TokenProvider tokenProvider) {
		return ReactorUaaClient.builder()
				.connectionContext(connectionContext)
				.tokenProvider(tokenProvider)
				.build();
	}

	@Bean
	DefaultCloudFoundryOperations cloudFoundryOperations(CloudFoundryClient cloudFoundryClient,
			DopplerClient dopplerClient,
			UaaClient uaaClient,
			@Value("${DEFAULT_ORG}") String organization,
			@Value("${DEFAULT_SPACE}") String space) {
		return DefaultCloudFoundryOperations.builder()
				.cloudFoundryClient(cloudFoundryClient)
				.dopplerClient(dopplerClient)
				.uaaClient(uaaClient)
				.organization(organization)
				.space(space)
				.build();
	}

	@Bean 
	CloudFoundryAPI cloudFoundryAPI(DefaultCloudFoundryOperations cloudFoundryOperations, @Value("${UAA_ORIGIN}") String uaa_origin) {
		return new CloudFoundryAPI(cloudFoundryOperations, uaa_origin);
	}
}
