package dev.suse.explore.cap;

import org.cloudfoundry.client.CloudFoundryClient;
import org.cloudfoundry.doppler.DopplerClient;
import org.cloudfoundry.operations.DefaultCloudFoundryOperations;
import org.cloudfoundry.operations.applications.PushApplicationRequest;
import org.cloudfoundry.operations.useradmin.CreateUserRequest;
import org.cloudfoundry.reactor.ConnectionContext;
import org.cloudfoundry.reactor.DefaultConnectionContext;
import org.cloudfoundry.reactor.TokenProvider;
import org.cloudfoundry.reactor.client.ReactorCloudFoundryClient;
import org.cloudfoundry.reactor.doppler.ReactorDopplerClient;
import org.cloudfoundry.reactor.routing.ReactorRoutingClient;
import org.cloudfoundry.reactor.tokenprovider.PasswordGrantTokenProvider;
import org.cloudfoundry.reactor.uaa.ReactorUaaClient;
import org.cloudfoundry.routing.RoutingClient;
import org.cloudfoundry.uaa.UaaClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.cloudfoundry.operations.CloudFoundryOperations;

@Component
public class CloudFoundryAPI {


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

	private CloudFoundryAPI(){

	}

	// TODO: Not sure if this needs to be singleton. Feel free to edit as needed or remove comment
	private static CloudFoundryAPI instance = null;
	public static CloudFoundryAPI getInstance() {
		if(instance==null){
			instance = new CloudFoundryAPI();
		}
		return instance;
	}	
	
	@Value("${UAA_ORIGIN}")
	String uaa_origin;

	//This seems to work but I don't like using an exception to get a real return...
	public boolean userAlreadyExists(CloudFoundryOperations ops, String email) {

		CreateUserRequest req = CreateUserRequest.builder().username(email).origin("cognito").build();
		try {
			//Block obviously blocks. But also bubbles any exceptions into the current thread
			ops.userAdmin().create(req).block();
			return false;
		}catch(IllegalArgumentException e) {
			return true;
		}
	}

	// TODO: create everything
	// TODO: Better Exception?
	public String buildEnvironmentForUser(CloudFoundryOperations ops, String email) throws Exception{
		
		//PushApplicationRequest req = PushApplicationRequest.builder().application()

		//TODO: personalize.
		return "https://firstlook.cap.explore.suse.dev";
	}

}