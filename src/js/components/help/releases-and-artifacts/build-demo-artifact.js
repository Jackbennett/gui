import React from 'react';

import { detectOsIdentifier } from '../../../helpers';
import CopyCode from '../../common/copy-code';

// we don't support windows yet, so we'll point them to the linux file instead
const downloadFolder = {
  Windows: 'linux',
  MacOs: 'darwin',
  Unix: 'linux',
  Linux: 'linux'
};

export default class BuildDemoArtifact extends React.PureComponent {
  render() {
    const { demoArtifactLink, menderVersion = 'master', menderArtifactVersion = 'master' } = this.props;
    var executable = `
sudo chmod +x mender-artifact && \\
sudo mv mender-artifact /usr/local/bin`;
    const artifactGenerator = 'single-file-artifact-gen';
    const artifactName = 'demo-webserver-updated';

    const file_install = `
wget https://raw.githubusercontent.com/mendersoftware/mender/${menderVersion}/support/modules-artifact-gen/${artifactGenerator} && \\
sudo chmod +x ${artifactGenerator}`;

    const generate = `
ARTIFACT_NAME="${artifactName}" && \\
DEVICE_TYPE="generic_x86" && \\
OUTPUT_PATH="${artifactName}.mender" && \\
DEST_DIR="/var/www/localhost/htdocs/" && \\
FILE_NAME="index.html" && \\
./${artifactGenerator} -n \${ARTIFACT_NAME} \
-t \${DEVICE_TYPE} -d \${DEST_DIR} -o \${OUTPUT_PATH} \
\${FILE_NAME}
`;

    const file_modification = `cat >index.html <<EOF
Hello World!
EOF
`;

    return (
      <div>
        <h2>Building the demo application update Artifact</h2>

        <p>
          If you have been following the tutorial tooltips to deploy your first application update, the third step is to build and deploy your own Artifact to
          your device.
        </p>

        <h3>Download demo application</h3>
        <p>
          For the demo tutorial, we provided you with a demo artifact that runs a simple web server on your device, serving a page that you can open in your web
          browser. You can use that demo application to learn how to build a new Artifact yourself.
        </p>

        <p>
          1.{' '}
          <a
            href={`https://d1b0l86ne08fsf.cloudfront.net/mender-artifact/${menderArtifactVersion}/${downloadFolder[detectOsIdentifier()]}/mender-artifact`}
            target="_blank"
          >
            Download the mender-artifact tool here
          </a>
          , extract it then make it executable by running:
        </p>
        <CopyCode code={executable} />
        <p>
          2. Copy and paste the following to download <span className="code">single-file-artifact-gen</span> and make it executable:
        </p>
        <CopyCode code={file_install} />
        <p>
          3. And <a href={demoArtifactLink}>download the demo application</a>.
        </p>

        <h3>Edit the contents</h3>
        <p>
          4. Take the <span className="code">mender-demo-artifact</span> Artifact you just downloaded, and extract its contents and enclosed{' '}
          <span className="code">.tar</span> files until you can see the <i>index.html</i> file within.
        </p>
        <p>
          5. Replace the contents of <i>index.html</i> with a simple string (&quot;Hello world&quot;), so you will be able to easily see the change when the
          webpage content is updated. This can be done by using:
        </p>
        <CopyCode code={file_modification} />
        <p>
          6. Now, you can create a new version of the demo webserver application with this modified <i>index.html</i> file. Generate a new Artifact by copying &
          pasting the following snippet.
        </p>
        <p>
          NOTE: You should replace the <span className="code">generic_x86</span> device type with the type you require.
        </p>
        <CopyCode code={generate} />
        <p>
          You should now have a new Artifact file called <span className="code">demo-webserver-updated.mender</span>!
        </p>
        <p>
          If you upload this Artifact to the Mender server, it will create a new Release. You can then deploy this new Release of the webserver demo to your
          device, and when it has updated successfully you should see the page content will have been replaced with the &quot;Hello world&quot; string you
          modified.
        </p>
      </div>
    );
  }
}
