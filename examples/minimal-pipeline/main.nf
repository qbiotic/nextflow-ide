nextflow.enable.dsl=2

process WRITE_GREETING {
    output:
    path 'greeting.txt'

    script:
    """
    echo 'Hello from the Nextflow IDE smoke pipeline' > greeting.txt
    """
}

workflow {
    WRITE_GREETING()
}
