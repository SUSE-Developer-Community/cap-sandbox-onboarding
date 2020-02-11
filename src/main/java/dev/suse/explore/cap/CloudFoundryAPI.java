package dev.suse.explore.cap;

import org.cloudfoundry.operations.useradmin.CreateUserRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.cloudfoundry.operations.CloudFoundryOperations;

@Component
public class CloudFoundryAPI {
	

	@Autowired
	private ApplicationContext context;
	
	
	@Value("${UAA_ORIGIN}")
	String uaa_origin;

	//This seems to work but I don't like using an exception to get a real return...
	public boolean userAlreadyExists(String email) {
		CloudFoundryOperations ops = context.getBean(CloudFoundryOperations.class);

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
	public String buildEnvironmentForUser(String email) throws Exception{
		CloudFoundryOperations ops = context.getBean(CloudFoundryOperations.class);
		
		//PushApplicationRequest req = PushApplicationRequest.builder().application()

		//TODO: personalize.
		return "https://firstlook.cap.explore.suse.dev";
	}

}