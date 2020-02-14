package dev.suse.explore.cap;

import org.cloudfoundry.operations.useradmin.CreateUserRequest;
import org.cloudfoundry.operations.organizations.CreateOrganizationRequest;
import org.cloudfoundry.operations.spaces.CreateSpaceRequest;
import org.cloudfoundry.operations.useradmin.SetOrganizationRoleRequest;
import org.cloudfoundry.operations.useradmin.SetSpaceRoleRequest;
import org.cloudfoundry.operations.useradmin.SpaceRole;
import org.cloudfoundry.operations.useradmin.OrganizationRole;
import org.cloudfoundry.operations.CloudFoundryOperations;

import reactor.core.publisher.Mono;


public class CloudFoundryAPI {
	private CloudFoundryOperations ops;
	private String uaa_origin;
	
	public CloudFoundryAPI(CloudFoundryOperations ops, String uaa_origin){
		this.ops = ops;
		this.uaa_origin = uaa_origin;
	}
	

	//This seems to work but I don't like using an exception to get a real return...
	//Is there a way to check if a user exists without creating it?
	public boolean userAlreadyExists(String email) {

		CreateUserRequest req = CreateUserRequest.builder().username(email).origin(uaa_origin).build();
		try {
			//Block obviously blocks. But also bubbles any exceptions into the current thread
			ops.userAdmin().create(req).block();
			return false;
		}catch(IllegalArgumentException e) {
			System.err.println(e.getMessage());
			return true;
		}
	}

	public String cleanEmail(String email){
		return email.replaceAll("\\W", "_");
	}

	// TODO: create everything
	// TODO: Better Exception?
	public String buildEnvironmentForUser(String email) throws Exception{
		
		//**********create the org***************
		//create org name from email: foo.bar@bar.com -> foo_bar_bar_com
		String orgname = this.cleanEmail(email);
		System.out.println("Creating org " + orgname + " for user " + email + "...");

		// TODO: replace quota name string with an env variable or something
		CreateOrganizationRequest req = CreateOrganizationRequest.builder().organizationName(orgname).quotaDefinitionName("sandbox").build();
		//Do I need to call .block() in the end? Why if so?
		ops.organizations().create(req).block();


		//**********make user org manager*************
		ops.userAdmin().setOrganizationRole(
				SetOrganizationRoleRequest.builder().organizationName(orgname).organizationRole(OrganizationRole.MANAGER).username(email).build()
				).block();

		//***********create the default spaces************
		// TODO: there is probably an elegant way to fold these into one call somehow
		// TODO: Does the user get roles assigned for these spaces automatically?

		System.out.println("Creating spaces prod and samples for org " + orgname + "...");
		Mono.zip(
		  this.createSpace(orgname, "prod"),
		  this.createSpace(orgname, "samples")
		).doOnError((Throwable e)->{
			System.err.println("Error creating Space");
			System.err.println(e.getMessage());
		}).block();

		System.out.println("Creating spaces dev and test for org " + orgname + "...");
		Mono.zip(
			this.createSpace(orgname, "dev"),
		  this.createSpace(orgname, "test")
		).doOnError((Throwable e)->{
			System.err.println("Error creating Space");
			System.err.println(e.getMessage());
		}).block();

		System.out.println("Creating roles MANAGER and DEVELOPER for user " + email + " in dev...");
		Mono.zip(
		  this.setSpaceRole(email, orgname, "dev", SpaceRole.MANAGER),
			this.setSpaceRole(email, orgname, "dev", SpaceRole.DEVELOPER)
		).doOnError((Throwable e)->{
			System.err.println("Error creating Dev Roles");
			System.err.println(e.getMessage());
		}).block();

		System.out.println("Creating roles MANAGER and DEVELOPER for user " + email + " in test...");
		Mono.zip(
		  this.setSpaceRole(email, orgname, "test", SpaceRole.MANAGER),
		  this.setSpaceRole(email, orgname, "test", SpaceRole.DEVELOPER)
		).doOnError((Throwable e)->{
			System.err.println("Error creating Test Roles");
			System.err.println(e.getMessage());
		}).block();

		System.out.println("Creating roles MANAGER and DEVELOPER for user " + email + " in prod...");
		Mono.zip(
	    this.setSpaceRole(email, orgname, "prod", SpaceRole.MANAGER),
			this.setSpaceRole(email, orgname, "prod", SpaceRole.DEVELOPER)
		).doOnError((Throwable e)->{
			System.err.println("Error creating Prod Roles");
			System.err.println(e.getMessage());
		}).block();

		System.out.println("Creating roles MANAGER and DEVELOPER for user " + email + " in samples...");
		Mono.zip(
		  this.setSpaceRole(email, orgname, "samples", SpaceRole.MANAGER),
	    this.setSpaceRole(email, orgname, "samples", SpaceRole.DEVELOPER)
		).doOnError((Throwable e)->{
			System.err.println("Error creating Samples Roles");
			System.err.println(e.getMessage());
		}).block();


		//PushApplicationRequest req = PushApplicationRequest.builder().application()

		//TODO: personalize.
		return "https://firstlook.cap.explore.suse.dev";
	}

	private Mono<Void> createSpace(String org, String space) {
		return ops.spaces().create(
				CreateSpaceRequest.builder().name(space).organization(org).build()
				);
	}

	private Mono<Void> setSpaceRole(String username, String org, String space, SpaceRole role){
		return ops.userAdmin().setSpaceRole(
			SetSpaceRoleRequest.builder().organizationName(org).spaceName(space).spaceRole(role).username(username).build()
			);
	}

}