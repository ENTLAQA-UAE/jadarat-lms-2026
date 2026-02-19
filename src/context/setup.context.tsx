"use client"
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { setOrganizationSettings, setOrganizationSubscription,updateLoading } from '@/redux/organization.slice';
import { store } from '@/redux/sotre';
import { setUser } from '@/redux/user.slice';

interface SetupProviderProps {
    children: React.ReactNode;
    organizationDetails: any;
    organizationSubscription: any;
    userDetails: any;
}

function SetupProvider({
    children,
    organizationDetails,
    organizationSubscription,
    userDetails,
}: SetupProviderProps) {
    useEffect(() => {
        if (organizationDetails) {
            store.dispatch(
                setOrganizationSettings({
                    authBackground: organizationDetails.auth_bg ?? '/side.png',
                    logo: organizationDetails.logo ?? '/logo.png',
                    primaryColor: organizationDetails.primary_color ?? '#706efa',
                    secondaryColor: organizationDetails.secondary_color,
                    organization_id: organizationDetails.organization_id,
                    registerationEnabled: organizationDetails.registeration_enabled,
                    registerationRequireApproval: organizationDetails.registeration_require_approval,
                    registerationRequireSpecificDomain: organizationDetails.registeration_require_specific_domain,
                    registerationDomain: organizationDetails.registeration_domain,
                    courseExpirationEnabled: organizationDetails.course_expiration_enabled,
                    courseExpirationPeriod: organizationDetails.course_expiration_period,
                    courseSelfEntrollmentPolicy: organizationDetails.course_self_entrollment_policy,
                    name: organizationDetails.name,
                    certificate: {
                        certificateTemplate: organizationDetails.certificate_template,
                        certificateLogo: organizationDetails.certificate_logo,
                        certificateAuthTitle: organizationDetails.certificate_auth_title,
                        certificateSign: organizationDetails.certificate_sign,
                        certificateBGColor: organizationDetails.certificate_bg_color,
                        certificatePreview: organizationDetails.certificate_preview,
                    },
                    lang: organizationDetails.lang,
                })
            );
        } else {
            store.dispatch(updateLoading());
        }
    }, [organizationDetails]);

    useEffect(() => {
        if (organizationSubscription) {
            store.dispatch(setOrganizationSubscription(organizationSubscription));
        }
    }, [organizationSubscription]);

    useEffect(() => {
        if (userDetails) {
            store.dispatch(setUser(userDetails));
            if (window.Weglot) {
                setTimeout(() => {
                    window.Weglot.switchTo(userDetails.lang);
                }, 500);
            }
        }
    }, [userDetails]);

    return <Provider store={store}>{children}</Provider>;
}

export default SetupProvider;
