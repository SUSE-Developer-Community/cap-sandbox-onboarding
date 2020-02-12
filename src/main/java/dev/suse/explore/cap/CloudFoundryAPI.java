package dev.suse.explore.cap;

import org.cloudfoundry.operations.useradmin.CreateUserRequest;
import org.cloudfoundry.operations.organizations.CreateOrganizationRequest;
import org.cloudfoundry.operations.spaces.CreateSpaceRequest;
import org.cloudfoundry.operations.useradmin.SetOrganizationRoleRequest;

import org.cloudfoundry.operations.CloudFoundryOperations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class CloudFoundryAPI {
	

	@Autowired
	private ApplicationContext context;
	
	
	@Value("${UAA_ORIGIN}")
	String uaa_origin;

	//This seems to work but I don't like using an exception to get a real return...
	//Is there a way to check if a user exists without creating it?
	public boolean userAlreadyExists(String email) {
		CloudFoundryOperations ops = context.getBean(CloudFoundryOperations.class);

		CreateUserRequest req = CreateUserRequest.builder().username(email).origin("cognito").build();
		try {
			//Block obviously blocks. But also bubbles any exceptions into the current thread
			ops.userAdmin().create(req).block();
			return false;
		}catch(IllegalArgumentException e) {
			e.printStackTrace();
			return true;
		}
	}

	// TODO: create everything
	// TODO: Better Exception?
	public String buildEnvironmentForUser(String email) throws Exception{
		CloudFoundryOperations ops = context.getBean(CloudFoundryOperations.class);
		
		//**********create the org***************
		//create org name from email: foo.bar@bar.com -> foor_bar_bar_com
		String orgname = email.replace("\w", "_");

		//How do I tell which parameters the request needs?
		//TODO: replace quota name string with an env variable or something
		CreateOrganizationRequest req = CreateOrganizationRequest.builder().organizationName(orgname).quotaDefinitionName("sandbox").build();
		//Do I need to call .block() in the end? Why if so?
		ops.organizations().create(req).block();

		//**********make user org manager and developer*************
		SetOrganizationRoleRequest req = SetOrganizationRoleRequest.builder().organizationName(orgname).organizationRole("Manager").build();
		ops.useradmin().setOrganizationRole(req).block();
		SetOrganizationRoleRequest req = SetOrganizationRoleRequest.builder().organizationName(orgname).organizationRole("Developer").build();
		ops.useradmin().setOrganizationRole(req).block();

		//***********create the default spaces************
		//TODO: there is probably an elegant way to fold these into one call somehow
		//TODO: Does the user get roles assigned for these spaces automatically?
		CreateSpaceRequest req = CreateSpaceRequest.builder().name("dev").organization(orgname).build();
		ops.spaces().create(req).block();
		CreateSpaceRequest req = CreateSpaceRequest.builder().name("test").organization(orgname).build();
		ops.spaces().create(req).block();
		CreateSpaceRequest req = CreateSpaceRequest.builder().name("prod").organization(orgname).build();
		ops.spaces().create(req).block();
		CreateSpaceRequest req = CreateSpaceRequest.builder().name("samples").organization(orgname).build();
		ops.spaces().create(req).block();


		//PushApplicationRequest req = PushApplicationRequest.builder().application()

		//TODO: personalize.
		return "https://firstlook.cap.explore.suse.dev";
	}

}